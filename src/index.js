/** @module prefew */

import path from "path"

import {getConfigHome} from "platform-folders"
import fsp from "@absolunet/fsp"
import {noop, isFunction, isObject} from "lodash"
import winston from "winston"
import yargs from "yargs"
import sharp from "sharp"
import chokidar from "chokidar"

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
  await fsp.ensureDir(imageDirectory)
  const imageEntries = await fsp.readdir(imageDirectory)
  log.info("Loaded %s images", imageEntries.length)
  for (const entry of imageEntries) {
    const entryId = path.basename(entry, ".png")
    const entryOutputDirectory = path.join(outputDirectory, entryId)
    await fsp.ensureDir(entryOutputDirectory)
    const imagePath = path.join(imageDirectory, entry)
    const chokidarEmitter = chokidar.watch(imagePath, {}).on("change", async () => {
      log.info(`Received change event for ${entry}`)
      const sharpImage = sharp(imagePath).sequentialRead(true)
      for (const [presetId, preset] of Object.entries(presets)) {
        let processedImage
        if (preset.render |> isFunction) {
          processedImage = sharpImage
        } else if (preset.resize |> isObject) {
          log.info(`${presetId} ${preset.resize.size}`)
          const width = preset.resize.width || preset.resize.size
          const height = preset.resize.height || preset.resize.size
          const sharpenSigma = preset.resize.sharpenSigma
          processedImage = sharpImage
            .trim()
            .resize(width, height, {
              fit: "contain",
              background: "#FFFFFF00",
            })
            .sharpen(sharpenSigma)
        }
        await processedImage.toFile(path.join(entryOutputDirectory, `${presetId}.png`))
      }
    })
    chokidarEmitter.emit("change")
  }
}

yargs.command("$0", "Starts prefew server", noop, job).argv