import {pixelZoomOptions, cropOptions, sharpenOptions} from "../baseOptions"

const render = async (sharpImage, {size, stretch, sharpen, sharpenSigma, sharpenJagged, sharpenFlat}) => {
  const renderedImage = sharpImage
    .resize(size, size, {
      fit: stretch ? "fill" : "contain",
      background: "#FFFFFF00",
    })
  if (sharpen) {
    renderedImage.sharpen(sharpenSigma, sharpenFlat, sharpenJagged)
  }
  return renderedImage
}

export default {
  render,
  name: "Custom-sized square",
  options: {
    size: {
      defaultValue: 32,
      min: 8,
      max: 320,
      precision: 0,
      step: 8,
      type: "number",
    },
    stretch: {
      defaultValue: false,
      type: "boolean",
    },
    ...pixelZoomOptions(),
    ...cropOptions(),
    ...sharpenOptions(),
  },
}