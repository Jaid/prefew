import sharp from "sharp"

import Preset from "../Preset"
import {sharpenOptions, cropOptions} from "../baseOptions"

import backgroundLightBuffer from "./backgroundLight.png"
import backgroundDarkBuffer from "./backgroundDark.png"

const insertPositions = [
  {
    x: 17,
    y: 42,
  },
  {
    x: 17,
    y: 73,
  },
]

export default class extends Preset {

  constructor(prefewCore) {
    super(prefewCore)
    this.title = "Twitch Chat Badge"
    this.description = "Based on screenshots of Google Chrome on Windows 10."
    this.addOptionsSchema({
      darkMode: {
        defaultValue: true,
        type: "boolean",
      },
      ...sharpenOptions(),
      ...cropOptions(),
    })
  }

  async render(sharpImage, {cropTolerance, sharpen, sharpenSigma, sharpenFlat, sharpenJagged, darkMode}) {
    const backgroundBuffer = darkMode ? backgroundDarkBuffer : backgroundLightBuffer
    const squarePreset = this.prefewCore.presets.square
    const {buffer: renderedBadge} = await this.prefewCore.render(sharpImage, squarePreset, {
      sharpen,
      sharpenSigma,
      sharpenFlat,
      sharpenJagged,
      cropTolerance,
      size: 18,
    })
    return sharp(backgroundBuffer).composite(insertPositions.map(position => ({
      input: renderedBadge,
      left: position.x,
      top: position.y,
      gravity: sharp.gravity.northwest,
    })))
  }

}