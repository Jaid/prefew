import socketIo from "socket.io"
import {pick, mapValues} from "lodash"

export default class SocketServer {

  constructor(port, prefewCore) {
    this.prefewCore = prefewCore
    this.clientProfiles = {}
    this.server = socketIo()

    this.server.on("connection", client => {
      const profile = {
        socketClient: client,
        image: null,
        preset: null,
      }
      client.emit("hey", {
        presets: prefewCore.presetNames,
        images: mapValues(prefewCore.images, image => pick(image, "extension", "name")),
      })
      client.on("request", (image, preset) => {
        profile.image = image
        profile.preset = preset
      })
      client.on("requestImage", image => {
        profile.image = image
      })
      client.on("requestPreset", preset => {
        profile.preset = preset
      })
      this.clientProfiles[client.id] = profile
    })
    this.server.listen(port)
  }

  getInterestingPresetsForImage(name) {
    const interestingPresets = new Set
    for (const profile of Object.values(this.clientProfiles)) {
      if (profile.image === name) {
        interestingPresets.add(profile.preset)
      }
    }
    return [...interestingPresets]
  }

  pushPreview(image, preset, buffer) {
    const requestingClients = Object.values(this.clientProfiles).filter(profile => profile.image === image && profile.preset === preset)
    for (const client of requestingClients.map(profile => profile.socketClient)) {
      console.log(`Sending preview for preset ${preset} to client ${client.id}`)
      client.emit("newPreview", {
        image,
        preset,
        buffer,
      })
    }
  }

}