import sharp from "sharp"
import fss from "@absolunet/fss"
import renderAdvanced from "src/renderAdvanced"

import twitchEmote28 from "../twitchEmote28"

import backgroundFile from "./background.png"

const backgroundBuffer = fss.readFile(backgroundFile)

const render = async (sharpImage, {sharpenSigma}) => {
  let renderedImage = sharp(backgroundBuffer)
  const renderedEmote = await renderAdvanced(sharpImage, twitchEmote28, {sharpenSigma})
  renderedImage = renderedImage.composite([
    {
      input: renderedEmote,
    },
  ])
  return renderedImage
}

export default {
  render,
  name: "Twitch Chat",
  description: "Based on screenshots of Google Chrome on Windows 10.",
  options: {
    sharpenSigma: {
      defaultValue: 0.6,
      min: 0.1,
      max: 2,
      precision: 1,
      step: 0.1,
      type: "number",
    },
  },
}