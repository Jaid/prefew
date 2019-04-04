import {pixelZoom, cropTolerance, sharpen} from "../baseOptions"

const size = 56

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
    ...sharpen(),
  },
}