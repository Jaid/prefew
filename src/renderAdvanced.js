import sharp, {Sharp} from "sharp"
import {isString, isBuffer, mapValues} from "lodash"

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
  const sharpImage = sourceSharp
    .sequentialRead()
    .extend({ // Workaround for trim() to always use a fully transparent pixel as boring indicator
      left: 1,
      top: 1,
      bottom: 1,
      right: 1,
      background: {
        r: 1,
        g: 1,
        b: 1,
        alpha: 0,
      },
    })
    .trim(1)
  let processedImage = await preset.render(sharpImage, mergedOptions)
  if (mergedOptions.pixelZoom > 1) {
    const renderedBuffer = await processedImage
      .webp({
        quality: 100,
        lossless: true,
      })
      .toBuffer()
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