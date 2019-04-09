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
      ...sharpenOptions(),
      ...cropOptions(),
    })
  }

  async render(prefewCore, sharpImage, {cropTolerance, sharpen, sharpenSigma, sharpenFlat, sharpenJagged, darkMode}) {
    const backgroundBuffer = darkMode ? backgroundDarkBuffer : backgroundLightBuffer
    const renderedEmote = await prefewCore.render(backgroundBuffer, prefewCore.presets.discordEmote22.render, {
      sharpen,
      sharpenSigma,
      sharpenFlat,
      sharpenJagged,
      cropTolerance,
    })
    renderedImage = renderedImage.composite(insertPositions.map(position => ({
      input: renderedEmote,
      left: position.x,
      top: position.y,
      gravity: sharp.gravity.northwest,
    })))
    return renderedImage
  }

}