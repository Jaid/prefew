import path from "path"

import globby from "globby"
import fsp from "@absolunet/fsp"
import sharp from "sharp"
import parsePath from "lib/parsePath"
import EventEmitter from "eventemitter3"
import chokidar from "chokidar"
import jimp from "src/jimp"
import {isString, isBuffer, mapValues, isEmpty} from "lodash"

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
      state[presetName] = presetRequire(value).default
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
    const image = this.images[imageName]
    const interestedClients = this.getClientsForImage(imageName)
    if (interestedClients |> isEmpty) {
      return
    }
    debug("Determined %d interested clients", interestedClients.length)
    for (const client of interestedClients) {
      client.socketClient.emit("startingRender")
      if (image.type === "file" && !image.buffer) {
        image.buffer = await fsp.readFile(image.imagePath)
      }
      const sharpImage = sharp(image.buffer)
      const jobs = client.options.presets.map(async requestedPreset => {
        const renderedBuffer = await this.render(sharpImage, requestedPreset.name, requestedPreset.options)
        return {
          buffer: renderedBuffer,
          presetOptions: requestedPreset.options,
          image: imageName,
          presetName: requestedPreset.name,
          time: Number(new Date),
        }
      })
      const renderedBuffers = await Promise.all(jobs)
      client.socketClient.emit("newPreview", renderedBuffers)
      for (const mirrorClient of this.getClientsByMode("mirror")) {
        mirrorClient.socketClient.emit("newPreview", renderedBuffers)
      }
    }
  }

  async updateProviderImage(name, properties) {
    if (!this.images[name]) {
      await this.addImage(name, {
        type: "provider",
        codec: properties.codec,
        thumbnailSource: properties.buffer,
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

  async render(source, presetName, presetOptions) {
    const preset = this.presets[presetName]
    const defaultOptions = preset.options ? mapValues(preset.options, ({defaultValue}) => defaultValue) : {}
    const mergedOptions = {
      ...defaultOptions,
      ...presetOptions,
    }
    debug("Rendering %s with preset \"%s\" and options %o", isString(source) ? source : "buffer", preset.name, mergedOptions)
    const sourceSharp = do {
      if (isString(source)) {
        sharp(source)
      } else if (isBuffer(source)) {
        sharp(source)
      } else {
        source.clone()
      }
    }
    const loadedImageBuffer = await sourceSharp.sequentialRead().png({compressionLevel: 0}).toBuffer()
    const jimpImage = await jimp.read(loadedImageBuffer)
    const croppedBuffer = await jimpImage
      .deflateLevel(0) // Skipping compression
      .cropTransparent(mergedOptions.cropTolerance)
      .getBufferAsync(jimp.MIME_PNG)
    const sharpImage = sharp(croppedBuffer)
    let processedImage = await preset.render(sharpImage, mergedOptions)
    if (mergedOptions.pixelZoom > 1) {
      const renderedBuffer = await processedImage.png({compressionLevel: 0}).toBuffer()
      const newSharp = sharp(renderedBuffer)
      const {width, height} = await newSharp.metadata()
      processedImage = newSharp.resize(width * mergedOptions.pixelZoom, height * mergedOptions.pixelZoom, {kernel: "nearest"})
    }
    return processedImage
      .webp({
        quality: 100,
        lossless: true,
      })
      .toBuffer()
  }

}