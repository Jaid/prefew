import sharp from "sharp"

const size = 28

const render = async (sharpImage, {pixelZoom, sharpenSigma}) => {
  const renderedImage = sharpImage
    .trim()
    .resize(size, size, {
      fit: "contain",
      background: "#FFFFFF00",
    })
    .sharpen(sharpenSigma / 10)
  return renderedImage
}

export default {
  render,
  name: `Twitch Emote (${size}p)`,
  options: {
    pixelZoom: {
      default: 1,
      min: 1,
      max: 10,
      type: "number",
    },
    sharpenSigma: {
      default: 6,
      min: 3,
      max: 20,
      type: "number",
    },
  },
}