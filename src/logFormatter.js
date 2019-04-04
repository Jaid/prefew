import {format} from "winston"

export default () => {
  const splat = format.splat()
  const ms = format.ms()
  return format.combine(splat, ms, format.colorize(), format.simple())
}