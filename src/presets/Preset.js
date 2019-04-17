import {mapValues, isNumber} from "lodash"

import {clientZoomOptions} from "./baseOptions"

const debug = require("debug")(_PKG_NAME)

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

  validateOptions(requestedOptions) {
    for (const [optionName, optionValue] of Object.entries(requestedOptions)) {
      const schema = this.optionsSchema[optionName]
      if (schema) {
        if (schema.type === "number") {
          if (isNumber(schema.min) && schema.min > optionValue) {
            debug(`Invalid option ${optionName}: Given value ${optionValue} is smaller than min value ${schema.min}`)
            return false
          }
          if (isNumber(schema.max) && schema.max < optionValue) {
            debug(`Invalid option ${optionName}: Given value ${optionValue} is greater than max value ${schema.max}`)
            return false
          }
        }
      }
    }
    return true
  }

}