import configure from "@jimp/custom/es"
import plugins from "@jimp/plugins/es"
import png from "@jimp/png/es"

import cropTransparent from "./cropTransparent"

export default configure({
  types: [png],
  plugins: [plugins, cropTransparent],
})