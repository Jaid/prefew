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
        presetOptions: null,
        mode: null,
      }
      client.emit("hey", {
        presets: mapValues(prefewCore.presets, preset => pick(preset, "id", "name", "options")),
        images: mapValues(prefewCore.images, image => pick(image, "extension", "name")),
      })
      client.on("setMode", mode => {
        profile.mode = mode
      })
      client.on("setImage", image => {
        profile.image = image
        this.pushChangesForImage(image)
      })
      client.on("setPreset", preset => {
        profile.preset = preset
        this.pushChangesForImage(profile.image)
        profile.presetOptions = null
      })
      client.on("setPresetOptions", presetOptions => {
        profile.presetOptions = presetOptions
        this.pushChangesForImage(profile.image)
      })
      this.clientProfiles[client.id] = profile
    })
    this.server.listen(port)
  }

  async pushChangesForImage(name) {
    const interestedProfiles = Object.values(this.clientProfiles).filter(({mode, image, preset}) => {
      if (!preset) {
        return false
      }
      if (!mode) {
        return false
      }
      if (!image || image !== name) {
        return false
      }
      return true
    })
    const mirrorProfiles = Object.values(this.clientProfiles).filter(({mode}) => mode === "mirror")
    for (const profile of interestedProfiles) {
      const image = this.prefewCore.images[name]
      const preset = this.prefewCore.presets[profile.preset]
      const presetOptions = {}
      if (preset.options) {
        for (const [optionName, properties] of Object.entries(preset.options)) {
          presetOptions[optionName] = profile.presetOptions?.[optionName] || properties.default
        }
      }
      const buffer = await this.prefewCore.render(image, preset, presetOptions)
      const payload = {
        image: name,
        preset: profile.preset,
        presetOptions,
        buffer,
      }
      profile.socketClient.emit("newPreview", payload)
      for (const mirrorProfile of mirrorProfiles) {
        mirrorProfile.socketClient.emit("newPreview", payload)
      }
    }
  }

}