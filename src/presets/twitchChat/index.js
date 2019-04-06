import sharp from "sharp"
import fss from "@absolunet/fss"
import renderAdvanced from "src/renderAdvanced"

import twitchEmote28 from "../twitchEmote28"
import {sharpenOptions, cropOptions} from "../baseOptions"

import backgroundLightBuffer from "./backgroundLight.png"
import backgroundDarkBuffer from "./backgroundDark.png"

const insertPositions = [
  {
    x: 141,
    y: 61,
  },
  {
    x: 182,
    y: 92,
  },
  {
    x: 167,
    y: 123,
  },
  {
    x: 210,
    y: 123,
  },
  {
    x: 241,
    y: 123,
  },
  {
    x: 289,
    y: 123,
  },
]

const render = async (sharpImage, {cropTolerance, sharpen, sharpenSigma, sharpenFlat, sharpenJagged, darkMode}) => {
  let renderedImage = sharp(darkMode ? backgroundDarkBuffer : backgroundLightBuffer)
  const renderedEmote = await renderAdvanced(sharpImage, twitchEmote28, {
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
  name: "Twitch Chat",
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