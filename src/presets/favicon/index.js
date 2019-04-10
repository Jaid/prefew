import sharp from "sharp"

import Preset from "../Preset"
import {sharpenOptions, cropOptions} from "../baseOptions"

import backgroundLightBuffer from "./backgroundLight.png"
import backgroundDarkBuffer from "./backgroundDark.png"

const insertPositions = [
  {
    x: 259,
    y: 9,
  },
  {
    x: 331,
    y: 106,
  },
]

export default class extends Preset {

  constructor(prefewCore) {
    super(prefewCore)
    this.title = "Favicon"
    this.description = "Based on screenshots of Google Chrome 74 on Windows 10, 1080p."
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
    const renderedIcon16 = await this.prefewCore.render(sharpImage, squarePreset, {
      sharpen,
      sharpenSigma,
      sharpenFlat,
      sharpenJagged,
      cropTolerance,
      size: 16,
    })
    return sharp(backgroundBuffer).composite(insertPositions.map(position => ({
      input: renderedIcon16,
      left: position.x,
      top: position.y,
      gravity: sharp.gravity.northwest,
    })))
  }

}