import sharp from "sharp"

const size = 56

export default {
  name: `Twitch Emote (${size}p)`,
  render: async (sharpImage, {pixelZoom, sharpenSigma}) => {
    const renderedImage = sharpImage
      .trim()
      .resize(size, size, {
        fit: "contain",
        background: "#FFFFFF00",
      })
      .sharpen(sharpenSigma / 10)
    if (pixelZoom > 1) {
      const renderedBuffer = await renderedImage.png().toBuffer()
      const scaledImage = sharp(renderedBuffer)
        .resize(size * pixelZoom, size * pixelZoom, {kernel: "nearest"})
      return scaledImage
    }
    return renderedImage
  },
  options: {
    pixelZoom: {
      default: 1,
      min: 1,
      max: 6,
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