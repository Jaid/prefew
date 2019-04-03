import socketIo from "socket.io"
import {pick, mapValues} from "lodash"
import renderAdvanced from "src/renderAdvanced"

const debug = require("debug")(_PKG_NAME)

export default class SocketServer {

  constructor(port, prefewCore) {
    this.prefewCore = prefewCore
    this.clientProfiles = {}
    this.server = socketIo()

    this.server.on("connection", client => {
      const profile = {
        socketClient: client,
        mode: null,
      }
      client.emit("hey", {
        presets: mapValues(prefewCore.presets, preset => pick(preset, "id", "name", "options")),
        images: mapValues(prefewCore.images, image => pick(image, "extension", "name")),
      })
      client.on("setMode", mode => {
        debug("setMode: %s", mode)
        profile.mode = mode
      })
      client.on("setOptions", options => {
        profile.options = options
        debug("setOptions: %o", options)
        this.pushChangesForImage(profile.options.image)
      })
      client.on("disconnect", () => {
        delete this.clientProfiles[client.id]
        debug("Client %s disconnected, %d clients are connected now", client.id, Object.keys(this.clientProfiles).length)
      })
      this.clientProfiles[client.id] = profile
      debug("Client %s connected, %d clients are connected now", client.id, Object.keys(this.clientProfiles).length)
    })
    this.server.listen(port)
  }

  async pushChangesForImage(name) {
    const interestedProfiles = Object.values(this.clientProfiles).filter(({mode, options}) => {
      if (!options) {
        return false
      }
      if (!mode) {
        return false
      }
      if (!options.presets?.length) {
        return false
      }
      if (!options.image || options.image !== name) {
        return false
      }
      return true
    })
    debug("Determined %d interested profiles", interestedProfiles.length)
    const mirrorProfiles = Object.values(this.clientProfiles).filter(({mode}) => mode === "mirror")
    for (const profile of interestedProfiles) {
      const image = this.prefewCore.images[name]
      const renderedBuffers = []
      for (const selectedPreset of profile.options.presets) {
        const preset = this.prefewCore.presets[selectedPreset.name]
        const buffer = await renderAdvanced(image.imagePath, preset, selectedPreset.options)
        renderedBuffers.push({
          buffer,
          presetOptions: selectedPreset.options,
          image: name,
          presetName: selectedPreset.name,
          time: Number(new Date),
        })
      }
      profile.socketClient.emit("newPreview", renderedBuffers)
      for (const mirrorProfile of mirrorProfiles) {
        mirrorProfile.socketClient.emit("newPreview", renderedBuffers)
      }
    }
  }

}