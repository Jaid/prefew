import sharp from "sharp"
import {isString, isBuffer, mapValues} from "lodash"
import jimp from "src/jimp"

const debug = require("debug")(_PKG_NAME)

export default async (source, preset, presetOptions) => {
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