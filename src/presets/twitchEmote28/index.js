import {pixelZoomOptions, cropOptions, sharpenOptions} from "../baseOptions"

const size = 28

const render = async (sharpImage, {sharpen, sharpenSigma}) => {
  const renderedImage = sharpImage
    .resize(size, size, {
      fit: "contain",
      background: "#FFFFFF00",
    })
  if (sharpen) {
    renderedImage.sharpen(sharpenSigma)
  }
  return renderedImage
}

export default {
  render,
  name: `Twitch Emote (${size}p)`,
  options: {
    ...pixelZoomOptions(),
    ...cropOptions(),
    ...sharpenOptions(),
  },
}