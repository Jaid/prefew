import path from "path"

import parsePath from "lib/parsePath"
import fsp from "@absolunet/fsp"

export default async ({imageDirectory, outputDirectory}) => {
  await fsp.ensureDir(imageDirectory)
  const entries = {}
  const imageEntries = await fsp.readdir(imageDirectory)
  for (const entry of imageEntries) {
    const imagePath = path.join(imageDirectory, entry)
    const {name, extension} = imagePath |> parsePath
    const entryOutputDirectory = path.join(outputDirectory, name)
    await fsp.ensureDir(entryOutputDirectory)
    entries[name] = {
      name,
      imagePath,
      extension,
      entryOutputDirectory,
    }
  }
  return entries
}