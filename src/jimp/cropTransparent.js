const getPixel = (jimp, x, y) => {
  const bufferIndex = jimp.getPixelIndex(x, y)
  const red = jimp.bitmap.data[bufferIndex] / 255
  const green = jimp.bitmap.data[bufferIndex + 1] / 255
  const blue = jimp.bitmap.data[bufferIndex + 2] / 255
  const alpha = jimp.bitmap.data[bufferIndex + 3] / 255
  return {
    bufferIndex,
    x,
    y,
    red,
    green,
    blue,
    alpha,
  }
}

const getAlpha = (jimp, x, y) => {
  return jimp.bitmap.data[jimp.getPixelIndex(x, y) + 3] / 255
}

const countEmptyTopRows = (jimp, tolerance) => {
  for (let cropTop = 0; cropTop !== jimp.bitmap.height; cropTop++) {
    const y = cropTop
    for (let x = 0; x !== jimp.bitmap.width; x++) {
      const alpha = getAlpha(jimp, x, y)
      if (alpha > tolerance) {
        return cropTop
      }
    }
  }
  return true
}

const countEmptyBottomRows = (jimp, tolerance) => {
  for (let cropBottom = 0; cropBottom !== jimp.bitmap.height; cropBottom++) {
    const y = jimp.bitmap.height - cropBottom
    for (let x = 0; x !== jimp.bitmap.width; x++) {
      const alpha = getAlpha(jimp, x, y)
      if (alpha > tolerance) {
        return cropBottom
      }
    }
  }
  return true
}

const countEmptyLeftColumns = (jimp, tolerance) => {
  for (let cropLeft = 0; cropLeft !== jimp.bitmap.width; cropLeft++) {
    const x = cropLeft
    for (let y = 0; y !== jimp.bitmap.height; y++) {
      const alpha = getAlpha(jimp, x, y)
      if (alpha > tolerance) {
        return cropLeft
      }
    }
  }
  return true
}

const countEmptyRightColumns = (jimp, tolerance) => {
  for (let cropRight = 0; cropRight !== jimp.bitmap.width; cropRight++) {
    const x = jimp.bitmap.width - cropRight
    for (let y = 0; y !== jimp.bitmap.height; y++) {
      const alpha = getAlpha(jimp, x, y)
      if (alpha > tolerance) {
        return cropRight
      }
    }
  }
  return true
}

export default () => ({
  cropTransparent(tolerance = 0.1) {
    const crop = {
      top: countEmptyTopRows(this, tolerance),
      bottom: countEmptyBottomRows(this, tolerance),
      left: countEmptyLeftColumns(this, tolerance),
      right: countEmptyRightColumns(this, tolerance),
    }

    for (const cropValue of Object.values(crop)) {
      if (cropValue === true) {
        throw new Error("Cropping did actually clear the whole image. :(")
      }
    }

    const shouldCrop = () => {
      for (const cropValue of Object.values(crop)) {
        if (cropValue > 1) {
          return true
        }
      }
      return false
    }

    if (shouldCrop) {
      const newWidth = this.bitmap.width - (crop.left + crop.right)
      const newHeight = this.bitmap.height - (crop.top + crop.bottom)
      this.crop(crop.left, crop.top, newWidth, newHeight)
    }

    return this
  },
})