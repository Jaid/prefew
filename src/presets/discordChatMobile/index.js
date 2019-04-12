import sharp from "sharp"

import {cropOptions} from "../baseOptions"
import Preset from "../Preset"

import backgroundLightBuffer from "./backgroundLight.png"
import backgroundDarkBuffer from "./backgroundDark.png"

const insertPositions = [
  {
    x: 264,
    y: 198,
  },
  {
    x: 226,
    y: 253,
  },
  {
    x: 310,
    y: 253,
  },
  {
    x: 352,
    y: 253,
  },
  {
    x: 446,
    y: 253,
  },
]

export default class extends Preset {

  constructor(prefewCore) {
    super(prefewCore, 0.5)
    this.title = "Discord Chat (Mobile)"
    this.description = "Based on screenshots of Android 9 on a Google Pixel 2."
    this.addOptionsSchema({
      darkMode: {
        defaultValue: true,
        type: "boolean",
      },
      ...cropOptions(),
    })
  }

  async render(sharpImage, {sharpen, sharpenSigma, sharpenFlat, sharpenJagged, darkMode}) {
    const backgroundBuffer = darkMode ? backgroundDarkBuffer : backgroundLightBuffer
    const squarePreset = this.prefewCore.presets.square
    const {buffer: renderedEmote42} = await this.prefewCore.render(sharpImage, squarePreset, {
      sharpen,
      sharpenSigma,
      sharpenFlat,
      sharpenJagged,
      size: 42,
    })
    const smallLayers = insertPositions.map(position => ({
      input: renderedEmote42,
      left: position.x,
      top: position.y,
      gravity: sharp.gravity.northwest,
    }))
    const {buffer: renderedEmote84} = await this.prefewCore.render(sharpImage, squarePreset, {
      sharpen,
      sharpenSigma,
      sharpenFlat,
      sharpenJagged,
      size: 84,
    })
    const largeLayer = {
      input: renderedEmote84,
      left: 152,
      top: 94,
      gravity: sharp.gravity.northwest,
    }
    return sharp(backgroundBuffer).composite([largeLayer, ...smallLayers])
  }

}