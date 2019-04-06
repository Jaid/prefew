import sharp from "sharp"
import fss from "@absolunet/fss"
import renderAdvanced from "src/renderAdvanced"

import {sharpenOptions, cropOptions} from "../baseOptions"
import discordEmote22 from "../discordEmote22"

import backgroundLightBuffer from "./backgroundLight.png"
import backgroundDarkBuffer from "./backgroundDark.png"

const insertPositions = [
  {
    x: 79,
    y: 20,
  },
  {
    x: 125,
    y: 45,
  },
  {
    x: 109,
    y: 70,
  },
  {
    x: 149,
    y: 70,
  },
  {
    x: 173,
    y: 70,
  },
  {
    x: 219,
    y: 70,
  },
]

const render = async (sharpImage, {cropTolerance, sharpen, sharpenSigma, sharpenFlat, sharpenJagged, darkMode}) => {
  let renderedImage = sharp(darkMode ? backgroundDarkBuffer : backgroundLightBuffer)
  const renderedEmote = await renderAdvanced(sharpImage, discordEmote22, {
    sharpen,
    sharpenSigma,
    sharpenFlat,
    sharpenJagged,
    cropTolerance,
  })
  renderedImage = renderedImage.composite(insertPositions.map(position => ({
    input: renderedEmote,
    left: position.x,
    top: position.y,
    gravity: sharp.gravity.northwest,
  })))
  return renderedImage
}

export default {
  render,
  name: "Discord Chat",
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