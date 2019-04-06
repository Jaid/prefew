import sharp from "sharp"
import fss from "@absolunet/fss"
import renderAdvanced from "src/renderAdvanced"

import square from "../square"
import {sharpenOptions, cropOptions} from "../baseOptions"

import backgroundLightBuffer from "./backgroundLight.png"
import backgroundDarkBuffer from "./backgroundDark.png"

const insertPositions = [
  {
    x: 17,
    y: 42,
  },
  {
    x: 17,
    y: 73,
  },
]

const render = async (sharpImage, {cropTolerance, sharpen, sharpenSigma, sharpenFlat, sharpenJagged, darkMode}) => {
  let renderedImage = sharp(darkMode ? backgroundDarkBuffer : backgroundLightBuffer)
  const renderedBadge = await renderAdvanced(sharpImage, square, {
    sharpen,
    sharpenSigma,
    sharpenFlat,
    sharpenJagged,
    cropTolerance,
    size: 18,
  })
  renderedImage = renderedImage.composite(insertPositions.map(position => ({
    input: renderedBadge,
    left: position.x,
    top: position.y,
    gravity: sharp.gravity.northwest,
  })))
  return renderedImage
}

export default {
  render,
  name: "Twitch Chat Badge",
  description: "Based on screenshots of Google Chrome on Windows 10.",
  options: {
    darkMode: {
      defaultValue: true,
      type: "boolean",
    },
    ...sharpenOptions(),
    ...cropOptions(),
  },
}