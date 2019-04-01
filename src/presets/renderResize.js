export default resizeOptions => {
  const width = resizeOptions.width || resizeOptions.size
  const height = resizeOptions.height || resizeOptions.size
  const sharpenSigma = resizeOptions.sharpenSigma
  return sharpImage => sharpImage
    .trim()
    .resize(width, height, {
      fit: "contain",
      background: "#FFFFFF00",
    })
    .sharpen(sharpenSigma)
}