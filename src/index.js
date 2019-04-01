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

const job = async () => {
  const prefewCore = {
    configDirectory,
    imageDirectory,
    outputDirectory,
    presetNames: Object.keys(presets),
  }
  await fsp.ensureDir(imageDirectory)
  prefewCore.images = await loadEntries(prefewCore)

  log.info("%O", prefewCore)
  const server = new SocketServer(40666, prefewCore)
  log.info("Opened port 40666")

  for (const [name, properties] of Object.entries(prefewCore.images)) {
    const chokidarEmitter = chokidar.watch(properties.imagePath)
    chokidarEmitter.on("change", async () => {
      log.info(`Received change event for ${name}`)
      const interestingPresets = server.getInterestingPresetsForImage(name)
      if (!interestingPresets.length) {
        return
      }
      log.info("I need to render image %s with presets %O", name, interestingPresets)
      const sharpImage = sharp(properties.imagePath).sequentialRead(true)
      for (const interestingPreset of interestingPresets) {
        const renderedImage = await presets[interestingPreset]
          .render(sharpImage)
          .webp({
            quality: 100,
            lossless: true,
          })
          .toBuffer()
        server.pushPreview(name, interestingPreset, renderedImage)
      }
    })
    setInterval(() => chokidarEmitter.emit("change"), 10000)
  }

  // log.info("Loaded %s images", imageEntries.length)

  // for (const entry of imageEntries) {
  // const entryId = path.basename(entry, ".png")
  // const entryOutputDirectory = path.join(outputDirectory, entryId)
  // await fsp.ensureDir(entryOutputDirectory)
  // const imagePath = path.join(imageDirectory, entry)
  //  const chokidarEmitter = chokidar.watch(imagePath, {}).on("change", async () => {
  //  log.info(`Received change event for ${entry}`)
  //  const sharpImage = sharp(imagePath).sequentialRead(true)
  //  await processedImage.toFile(path.join(entryOutputDirectory, `${presetId}.png`))
  // })
  //  chokidarEmitter.emit("change")
  //  }
}

yargs
  .command("$0", "Starts prefew server", noop, job)
  .version(_PKG_VERSION)
  .argv