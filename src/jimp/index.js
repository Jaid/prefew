import configure from "@jimp/custom/es"
import png from "@jimp/png/es"
import plugins from "@jimp/plugins/es"

import cropTransparent from "./cropTransparent"

export default configure({
  types: [png],
  plugins: [plugins, cropTransparent],
})