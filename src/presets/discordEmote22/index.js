import {pixelZoomOptions, cropOptions} from "../baseOptions"
import Preset from "../Preset"

const size = 22

export default class extends Preset {

  constructor(prefewCore) {
    super(prefewCore)
    this.title = `Discord Emote (${size}p)`
    this.description = ""
    this.addOptionsSchema({
      ...pixelZoomOptions(),
      ...cropOptions(),
    })
  }

  async render(sharpImage) {
    const renderedImage = sharpImage
      .resize(size, size, {
        fit: "contain",
        background: "#FFFFFF00",
      })
    return renderedImage
  }

}