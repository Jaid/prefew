export const clientZoomOptions = () => ({
  clientZoom: {
    defaultValue: 1,
    min: 0.1,
    step: 0.1,
    precision: 1,
    max: 15,
    type: "number",
  },
})

export const cropOptions = () => ({
  cropTolerance: {
    defaultValue: 0.05,
    min: 0,
    max: 0.95,
    precision: 2,
    step: 0.1,
    type: "number",
  },
})

export const sharpenOptions = () => ({
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
  sharpenFlat: {
    defaultValue: 1,
    min: 0.1,
    max: 3,
    precision: 1,
    step: 0.1,
    type: "number",
  },
  sharpenJagged: {
    defaultValue: 2,
    min: 0.1,
    max: 3,
    precision: 1,
    step: 0.1,
    type: "number",
  },
})