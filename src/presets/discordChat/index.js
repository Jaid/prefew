import sharp from "sharp"
import fss from "@absolunet/fss"
import renderAdvanced from "src/renderAdvanced"

import discordEmote22 from "../discordEmote22"

import backgroundLightFile from "./backgroundLight.png"
import backgroundDarkFile from "./backgroundDark.png"

const backgroundLightBuffer = fss.readFile(backgroundLightFile)
const backgroundDarkBuffer = fss.readFile(backgroundDarkFile)

const insertPositions = [
  {
    x: 79,
    y: 9,
  },
  {
    x: 125,
    y: 34,
  },
  {
    x: 109,
    y: 59,
  },
  {
    x: 149,
    y: 59,
  },
  {
    x: 173,
    y: 59,
  },
  {
    x: 219,
    y: 59,
  },
]

const render = async (sharpImage, {sharpen, sharpenSigma, sharpenFlat, sharpenJagged, darkMode}) => {
  let renderedImage = sharp(darkMode ? backgroundDarkBuffer : backgroundLightBuffer)
  const renderedEmote = await renderAdvanced(sharpImage, discordEmote22, {
    sharpen,
    sharpenSigma,
    sharpenFlat,
    sharpenJagged,
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
  },
}