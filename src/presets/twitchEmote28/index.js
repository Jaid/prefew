import sharp from "sharp"

import {pixelZoom, cropTolerance} from "../baseOptions"

const size = 28

const render = async (sharpImage, {sharpenSigma}) => {
  const renderedImage = sharpImage
    .resize(size, size, {
      fit: "contain",
      background: "#FFFFFF00",
    })
    .sharpen(sharpenSigma)
  return renderedImage
}

export default {
  render,
  name: `Twitch Emote (${size}p)`,
  options: {
    ...pixelZoom(),
    ...cropTolerance(),
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