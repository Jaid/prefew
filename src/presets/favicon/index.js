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

  async render(prefewCore, sharpImage, {cropTolerance, sharpen, sharpenSigma, sharpenFlat, sharpenJagged, darkMode}) {
    const backgroundBuffer = darkMode ? backgroundDarkBuffer : backgroundLightBuffer
    const renderedIcon16 = await prefewCore.render(backgroundBuffer, prefewCore.presets.square.render, {
      sharpen,
      sharpenSigma,
      sharpenFlat,
      sharpenJagged,
      cropTolerance,
      size: 16,
    })
    renderedImage = renderedImage.composite(insertPositions.map(position => ({
      input: renderedIcon16,
      left: position.x,
      top: position.y,
      gravity: sharp.gravity.northwest,
    })))
    return renderedImage
  }

}