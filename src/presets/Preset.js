import {mapValues} from "lodash"

export default class {

  constructor(prefewCore) {
    this.prefewCore = prefewCore
    this.pixelatedZoom = false
  }

  addOptionsSchema(optionsSchema) {
    this.optionsSchema = {
      ...this.optionsSchema,
      ...optionsSchema,
    }
    this.defaultOptions = mapValues(this.optionsSchema, ({defaultValue}) => defaultValue)
  }

  mergeOptions(options) {
    return {
      ...this.defaultOptions,
      ...options,
    }
  }

}