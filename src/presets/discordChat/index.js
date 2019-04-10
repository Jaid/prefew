import sharp from "sharp"

import {sharpenOptions, cropOptions} from "../baseOptions"
import Preset from "../Preset"

import backgroundLightBuffer from "./backgroundLight.png"
import backgroundDarkBuffer from "./backgroundDark.png"

const insertPositions = [
  {
    x: 79,
    y: 20,
  },
  {
    x: 125,
    y: 45,
  },
  {
    x: 109,
    y: 70,
  },
  {
    x: 149,
    y: 70,
  },
  {
    x: 173,
    y: 70,
  },
  {
    x: 219,
    y: 70,
  },
]

export default class extends Preset {

  constructor(prefewCore) {
    super(prefewCore)
    this.title = "Discord Chat"
    this.description = "Based on screenshots of Google Chrome on Windows 10."
    this.addOptionsSchema({
      darkMode: {
        defaultValue: true,
        type: "boolean",
      },
      ...cropOptions(),
    })
  }

  async render(sharpImage, {cropTolerance, sharpen, sharpenSigma, sharpenFlat, sharpenJagged, darkMode}) {
    const discordEmote22Preset = this.prefewCore.presets.discordEmote22
    const backgroundBuffer = darkMode ? backgroundDarkBuffer : backgroundLightBuffer
    const renderedEmote = await this.prefewCore.render(sharpImage, discordEmote22Preset, {
      sharpen,
      sharpenSigma,
      sharpenFlat,
      sharpenJagged,
      cropTolerance,
    })
    return sharp(backgroundBuffer).composite(insertPositions.map(position => ({
      input: renderedEmote,
      left: position.x,
      top: position.y,
      gravity: sharp.gravity.northwest,
    })))
  }

}