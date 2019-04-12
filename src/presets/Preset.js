import {mapValues} from "lodash"

import {clientZoomOptions} from "./baseOptions"

export default class {

  constructor(prefewCore, defaultZoom = 1) {
    this.prefewCore = prefewCore
    this.pixelatedZoom = false
    this.addOptionsSchema(clientZoomOptions(defaultZoom))
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