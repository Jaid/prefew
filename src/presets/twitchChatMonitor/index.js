import sharp from "sharp"

import Preset from "../Preset"
import {sharpenOptions, cropOptions} from "../baseOptions"

import backgroundBuffer from "./background.png"

const insertPositions = [
  {
    size: 28,
    x: 180,
    y: 159,
  },
  {
    size: 28,
    x: 92,
    y: 8,
  },
  {
    size: 56,
    x: 122,
    y: 131,
  },
  {
    size: 56,
    x: 122,
    y: 8,
  },
  {
    size: 112,
    x: 8,
    y: 75,
  },
  {
    size: 112,
    x: 180,
    y: 8,
  },
]

export default class extends Preset {

  constructor(prefewCore) {
    super(prefewCore)
    this.title = "Twitch Chat Monitor"
    this.description = "Custom preset made for simple background contrast monitoring."
    this.addOptionsSchema({
      ...sharpenOptions(),
      ...cropOptions(),
      stretch: {
        defaultValue: false,
        type: "boolean",
      },
    })
  }

  async render(sharpImage, {stretch, cropTolerance, sharpen, sharpenSigma, sharpenFlat, sharpenJagged}) {
    const [
      {buffer: renderedEmote28},
      {buffer: renderedEmote56},
      {buffer: renderedEmote112},
    ] = await Promise.all([
      this.prefewCore.render(sharpImage, this.prefewCore.presets.square, {
        sharpen,
        sharpenSigma,
        sharpenFlat,
        sharpenJagged,
        cropTolerance,
        stretch,
        size: 28,
      }),
      this.prefewCore.render(sharpImage, this.prefewCore.presets.square, {
        cropTolerance,
        stretch,
        size: 56,
      }),
      this.prefewCore.render(sharpImage, this.prefewCore.presets.square, {
        cropTolerance,
        stretch,
        size: 112,
      }),
    ])
    const emoteBuffers = {
      28: renderedEmote28,
      56: renderedEmote56,
      112: renderedEmote112,
    }
    return sharp(backgroundBuffer).composite(insertPositions.map(instruction => ({
      input: emoteBuffers[instruction.size],
      left: instruction.x,
      top: instruction.y,
      gravity: sharp.gravity.northwest,
    })))
  }

}