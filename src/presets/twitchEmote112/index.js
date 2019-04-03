import sharp from "sharp"

const size = 112

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
    pixelZoom: {
      defaultValue: 1,
      min: 1,
      max: 3,
      type: "number",
    },
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