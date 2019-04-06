import sharp from "sharp"
import fss from "@absolunet/fss"
import renderAdvanced from "src/renderAdvanced"

import square from "../square"

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

const render = async (sharpImage, {sharpen, sharpenSigma, sharpenFlat, sharpenJagged, darkMode}) => {
  let renderedImage = sharp(darkMode ? backgroundDarkBuffer : backgroundLightBuffer)
  const renderedEmote42 = await renderAdvanced(sharpImage, square, {
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
  const renderedEmote84 = await renderAdvanced(sharpImage, square, {
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
  renderedImage = renderedImage.composite([largeLayer, ...smallLayers])
  return renderedImage
}

export default {
  render,
  name: "Discord Chat (Mobile)",
  description: "Based on screenshots of Android 9 on a Google Pixel 2.",
  options: {
    darkMode: {
      defaultValue: true,
      type: "boolean",
    },
  },
}