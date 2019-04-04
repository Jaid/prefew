export const pixelZoom = () => ({
  pixelZoom: {
    defaultValue: 1,
    min: 1,
    max: 10,
    type: "number",
  },
})

export const cropTolerance = () => ({
  cropTolerance: {
    defaultValue: 0.1,
    min: 0,
    max: 0.95,
    precision: 2,
    step: 0.05,
    type: "number",
  },
})

export const sharpenSigma = () => ({
  sharpen: {
    type: "boolean",
    defaultValue: false,
  },
  sharpenSigma: {
    defaultValue: 0.6,
    min: 0.2,
    max: 2,
    precision: 1,
    step: 0.1,
    type: "number",
  },
})