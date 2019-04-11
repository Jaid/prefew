import {clientZoomOptions, cropOptions, sharpenOptions} from "../baseOptions"
import Preset from "../Preset"

export default class extends Preset {

  constructor(prefewCore) {
    super(prefewCore)
    this.title = "Custom-sized square"
    this.pixelatedZoom = true
    this.addOptionsSchema({
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
      ...clientZoomOptions(),
      ...cropOptions(),
      ...sharpenOptions(),
    })
  }

  async render(sharpImage, {size, stretch, sharpen, sharpenSigma, sharpenJagged, sharpenFlat}) {
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

}