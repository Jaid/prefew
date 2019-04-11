import {cropOptions, sharpenOptions} from "../baseOptions"
import Preset from "../Preset"

const size = 112

export default class extends Preset {

  constructor(prefewCore) {
    super(prefewCore)
    this.pixelatedZoom = true
    this.title = `Twitch Emote (${size}p)`
    this.addOptionsSchema({
      ...cropOptions(),
      ...sharpenOptions(),
    })
  }

  async render(sharpImage, {sharpen, sharpenSigma, sharpenJagged, sharpenFlat}) {
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

}