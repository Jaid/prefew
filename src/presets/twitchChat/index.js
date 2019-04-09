import sharp from "sharp"

import Preset from "../Preset"
import {sharpenOptions, cropOptions} from "../baseOptions"

import backgroundLightBuffer from "./backgroundLight.png"
import backgroundDarkBuffer from "./backgroundDark.png"

const insertPositions = [
  {
    x: 141,
    y: 61,
  },
  {
    x: 182,
    y: 92,
  },
  {
    x: 167,
    y: 123,
  },
  {
    x: 210,
    y: 123,
  },
  {
    x: 241,
    y: 123,
  },
  {
    x: 289,
    y: 123,
  },
]

export default class extends Preset {

  constructor(prefewCore) {
    super(prefewCore)
    this.title = "Twitch Chat"
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
    const renderedEmote = await prefewCore.render(backgroundBuffer, prefewCore.presets.twitchEmote28.render, {
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