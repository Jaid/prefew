/** @module prefew */

import path from "path"

import {getConfigHome} from "platform-folders"
import fsp from "@absolunet/fsp"
import {noop} from "lodash"
import winston from "winston"
import yargs from "yargs"
import sharp from "sharp"
import chokidar from "chokidar"

import loadEntries from "./loadEntries"
import SocketServer from "./SocketServer"
import twitchEmote28 from "./presets/twitchEmote28"
import twitchEmote56 from "./presets/twitchEmote56"
import twitchEmote112 from "./presets/twitchEmote112"
import formatter from "./logFormatter"

sharp.cache(false)

const presets = {
  twitchEmote28,
  twitchEmote56,
  twitchEmote112,
}

const configDirectory = path.join(getConfigHome(), _PKG_NAME)
const imageDirectory = path.join(configDirectory, "images")
const outputDirectory = path.join(configDirectory, "output")

const log = winston.createLogger({
  format: formatter(),
  transports: [new winston.transports.Console()],
})

log.info(`Config directory: ${configDirectory}`)

const render = async (image, preset, presetOptions) => {
  const sharpImage = sharp(image.imagePath).sequentialRead(true)
  let processedImage = await preset.render(sharpImage, presetOptions)
  if (presetOptions.pixelZoom > 1) {
    const renderedBuffer = await processedImage
      .webp({
        quality: 100,
        lossless: true,
      })
      .toBuffer()
    const newSharp = sharp(renderedBuffer)
    const {width, height} = await newSharp.metadata()
    processedImage = newSharp.resize(width * presetOptions.pixelZoom, height * presetOptions.pixelZoom, {kernel: "nearest"})
  }
  return processedImage
    .webp({
      quality: 100,
      lossless: true,
    })
    .toBuffer()
}

const job = async () => {
  const prefewCore = {
    configDirectory,
    imageDirectory,
    outputDirectory,
    presets,
    render,
  }
  await fsp.ensureDir(imageDirectory)
  prefewCore.images = await loadEntries(prefewCore)

  const server = new SocketServer(40666, prefewCore)
  log.info("Opened port 40666")

  log.info("%o", prefewCore)
  for (const [name, {imagePath}] of Object.entries(prefewCore.images)) {
    const chokidarEmitter = chokidar.watch(imagePath)
    chokidarEmitter.on("change", async () => {
      log.info(`Received change event for ${name}`)
      server.pushChangesForImage(name)
    })
  }
}

yargs
  .command("$0", "Starts prefew server", noop, job)
  .version(_PKG_VERSION)
  .argv