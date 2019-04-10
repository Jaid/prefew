import path from "path"

import globby from "globby"
import fsp from "@absolunet/fsp"
import sharp from "sharp"
import parsePath from "lib/parsePath"
import EventEmitter from "eventemitter3"
import chokidar from "chokidar"
import jimp from "src/jimp"
import {isString, isBuffer, isEmpty} from "lodash"
import PCancelable from "p-cancelable"

import SocketServer from "./SocketServer"

const debug = require("debug")(_PKG_NAME)

export default class extends EventEmitter {

  constructor(options) {
    super()
    options = {
      directory: ".",
      ...options,
    }
    this.imageDirectory = path.join(options.directory, "images")
    this.outputDirectory = path.join(options.directory, "output")
  }

  async setup() {
    this.presets = this.gatherPresets()
    this.images = {}
    await this.gatherImages()
    this.clients = {}
    this.server = new SocketServer(40666, this)
  }

  gatherPresets() {
    const presetRequire = require.context("./presets/", true, /index\.js$/)
    return presetRequire.keys().reduce((state, value) => {
      const presetName = value.match(/\.\/(?<key>[\da-z]+)\//i).groups.key
      const Preset = presetRequire(value).default
      state[presetName] = new Preset(this)
      return state
    }, {})
  }

  async gatherImages() {
    await fsp.ensureDir(this.imageDirectory)
    const entries = {}
    const imageEntries = await globby("*.(png|jpg|jpeg|webp|tiff)", {
      cwd: this.imageDirectory,
      onlyFiles: true,
    })
    const jobs = imageEntries.map(async entry => {
      const imagePath = path.join(this.imageDirectory, entry)
      const {name, extension} = imagePath |> parsePath
      const chokidarEmitter = chokidar.watch(imagePath)
      chokidarEmitter.on("change", async () => {
        const buffer = await fsp.readFile(imagePath)
        await this.updateImage(name, buffer)
      })
      await this.addImage(name, {
        extension,
        imagePath,
        type: "file",
        thumbnailSource: imagePath,
      })
    })

    await Promise.all(jobs)
    return entries
  }

  async generateThumbnail(thumbnailSource) {
    return sharp(thumbnailSource)
      .resize(28, 28, {
        fit: "contain",
        background: "#FFFFFF00",
      })
      .webp()
      .toBuffer()
  }

  async addImage(name, options) {
    const entryOutputDirectory = path.join(this.outputDirectory, name)
    await fsp.ensureDir(entryOutputDirectory)
    const image = {
      entryOutputDirectory,
      ...options,
    }
    if (options.thumbnailSource) {
      image.thumbnail = await this.generateThumbnail(options.thumbnailSource)
    }
    this.images[name] = image
    this.emit("imageAdded", name)
  }

  async updateImage(name, buffer) {
    debug("Image %s updated", name)
    const image = this.images[name]
    image.buffer = buffer
    this.emit("imageUpdated", name)
    await this.updateImagePreviews(name)
  }

  async updateImagePreviews(imageName) {
    const interestedClients = this.getClientsForImage(imageName)
    if (interestedClients |> isEmpty) {
      return
    }
    debug("Determined %d interested clients", interestedClients.length)
    for (const interestedClient of interestedClients) {
      this.renderPreviewsForClient(interestedClient)
    }
  }

  async renderPreviewsForClient(client) {
    client.socketClient.emit("startingRender")
    const imageName = client.options.image
    const image = this.images[imageName]
    if (image.type === "file" && !image.buffer) {
      debug("Initially reading file contents for image %s", imageName)
      image.buffer = await fsp.readFile(image.imagePath)
    }
    const forcedOptions = {
      ...image.forcedOptions,
    }
    const jobPayloads = client.options.presets.map(requestedPreset => {
      const preset = this.presets[requestedPreset.name]
      return {
        preset,
        imageName,
        previewId: requestedPreset.previewId,
        presetName: requestedPreset.name,
        buffer: image.buffer,
        options: preset.mergeOptions({
          ...requestedPreset.options,
          ...forcedOptions,
        }),
      }
    })
    const workerStartTime = Date.now()
    client.workerStartTime = workerStartTime
    const renderWorker = this.createRenderWorker(jobPayloads)
    renderWorker.workerStartTime = workerStartTime
    if (client.renderWorker) {
      debug("There is already a job running. Trying to overwrite.")
      client.renderWorker.cancel()
    }
    client.renderWorker = renderWorker
    const renderedBuffers = await renderWorker
    if (renderedBuffers && client.workerStartTime === renderWorker.workerStartTime) {
      client.lastRenderResult = renderedBuffers
      client.socketClient.emit("newPreview", renderedBuffers)
      for (const mirrorClient of this.getClientsByMode("mirror")) {
        mirrorClient.socketClient.emit("newPreview", renderedBuffers)
      }
      client.renderWorker = null
    }
  }

  createRenderWorker(jobPayloads) {
    const jobs = jobPayloads.map(async jobPayload => {
      const startTime = Date.now()
      const renderedBuffer = await this.render(jobPayload.buffer, jobPayload.preset, jobPayload.options)
      return {
        startTime,
        previewId: jobPayload.previewId,
        presetOptions: jobPayload.options,
        buffer: renderedBuffer,
        image: jobPayload.imageName,
        presetName: jobPayload.presetName,
        endTime: Date.now(),
      }
    })
    return new PCancelable((resolve, reject, onCancel) => {
      onCancel.shouldReject = false
      onCancel(() => {
        debug("Cancelled")
        resolve(false)
      })
      Promise.all(jobs).then(resolve).catch(reject)
    })
  }

  async updateProviderImage(name, properties) {
    if (!this.images[name]) {
      await this.addImage(name, {
        type: "provider",
        codec: properties.codec,
        thumbnailSource: properties.buffer,
        forcedOptions: properties.forcedOptions,
      })
    }
    await this.updateImage(name, properties.buffer)
  }

  updateClientOptions(id, options) {
    const client = this.clients[id]
    client.options = options
    this.updateImagePreviews(options.image)
  }

  getClientsByMode(desiredMode) {
    return Object.values(this.clients).filter(({mode}) => mode === desiredMode)
  }

  getClientsForImage(imageName) {
    return this.getClientsByMode("user").filter(({options}) => {
      if (!options?.presets?.length) {
        return false
      }
      if (!options.image || options.image !== imageName) {
        return false
      }
      return true
    })
  }

  addClient(profile) {
    this.clients[profile.socketClient.id] = profile
    debug("%s Client %s connected, %d clients are connected now", profile.mode, profile.socketClient.id, Object.keys(this.clients).length)
  }

  removeClient(clientId) {
    delete this.clients[clientId]
    debug("Client %s disconnected, %d clients are connected now", clientId, Object.keys(this.clients).length)
  }

  async render(source, preset, options) {
    // debug("Rendering %s with preset \"%s\" and options %o", isString(source) ? source : "buffer", preset.name, mergedOptions)
    const sourceSharp = do {
      if (isString(source)) {
        sharp(source)
      } else if (isBuffer(source)) {
        sharp(source)
      } else {
        source.clone()
      }
    }
    let sharpImage
    if (options.skipTrimming) {
      sharpImage = sourceSharp
    } else {
      const loadedImageBuffer = await sourceSharp.png({compressionLevel: 0}).toBuffer()
      const jimpImage = await jimp.read(loadedImageBuffer)
      const croppedBuffer = await jimpImage
        .deflateLevel(0) // Skipping compression
        .cropTransparent(options.cropTolerance)
        .getBufferAsync(jimp.MIME_PNG)
      sharpImage = sharp(croppedBuffer)
    }
    let processedImage = await preset.render(sharpImage, options)
    if (options.pixelZoom > 1) {
      const renderedBuffer = await processedImage.png({compressionLevel: 0}).toBuffer()
      const newSharp = sharp(renderedBuffer)
      const {width, height} = await newSharp.metadata()
      processedImage = newSharp.resize(width * options.pixelZoom, height * options.pixelZoom, {kernel: "nearest"})
    }
    return processedImage
      .webp({
        quality: 100,
        lossless: true,
      })
      .toBuffer()
  }

}