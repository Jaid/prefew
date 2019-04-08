import {pixelZoomOptions, cropOptions, sharpenOptions} from "../baseOptions"

const size = 56

const render = async (prefewCore, sharpImage, {sharpen, sharpenSigma, sharpenJagged, sharpenFlat}) => {
  const renderedImage = sharpImage
    .resize(size, size, {
      fit: "contain",
      background: "#FFFFFF00",
    })
  if (sharpen) {
    renderedImage.sharpen(sharpenSigma, sharpenFlat, sharpenJagged)
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