import {pixelZoomOptions, cropOptions} from "../baseOptions"

const size = 22

const render = async sharpImage => {
  const renderedImage = sharpImage
    .resize(size, size, {
      fit: "contain",
      background: "#FFFFFF00",
    })
  return renderedImage
}

export default {
  render,
  name: `Discord Emote (${size}p)`,
  options: {
    ...pixelZoomOptions(),
    ...cropOptions(),
  },
}