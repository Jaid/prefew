import sharp from "sharp"

import square from "../square"
import {sharpenOptions, cropOptions} from "../baseOptions"

import backgroundLightBuffer from "./backgroundLight.png"
import backgroundDarkBuffer from "./backgroundDark.png"

const insertPositions = [
  {
    x: 259,
    y: 9,
  },
  {
    x: 331,
    y: 106,
  },
]

const render = async (prefewCore, sharpImage, {cropTolerance, sharpen, sharpenSigma, sharpenFlat, sharpenJagged, darkMode}) => {
  let renderedImage = sharp(darkMode ? backgroundDarkBuffer : backgroundLightBuffer)
  const renderedIcon16 = await prefewCore.render(sharpImage, "square", {
    sharpen,
    sharpenSigma,
    sharpenFlat,
    sharpenJagged,
    cropTolerance,
    size: 16,
  })
  renderedImage = renderedImage.composite(insertPositions.map(position => ({
    input: renderedIcon16,
    left: position.x,
    top: position.y,
    gravity: sharp.gravity.northwest,
  })))
  return renderedImage
}

export default {
  render,
  name: "Favicon",
  description: "Based on screenshots of Google Chrome 74 on Windows 10, 1080p.",
  options: {
    darkMode: {
      defaultValue: true,
      type: "boolean",
    },
    ...sharpenOptions(),
    ...cropOptions(),
  },
}