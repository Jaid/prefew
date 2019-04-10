import socketIo from "socket.io"
import {pick, mapValues} from "lodash"

const debug = require("debug")(_PKG_NAME)

export default class SocketServer {

  constructor(port, prefewCore) {
    this.server = socketIo()
    this.server.on("connection", client => {
      const profile = {
        socketClient: client,
        mode: client.handshake.query.mode,
      }
      if (profile.mode === "user") {
        client.emit("hey", {
          presets: mapValues(prefewCore.presets, preset => pick(preset, "title", "optionsSchema")),
          images: mapValues(prefewCore.images, image => ({
            extension: image.extension,
            thumbnail: image.thumbnail,
            type: image.type,
          })),
        })
      } else if (profile.mode === "mirror") {
        client.emit("hey", {
          presets: mapValues(prefewCore.presets, preset => pick(preset, "title", "optionsSchema")),
          images: mapValues(prefewCore.images, ({extension}) => ({extension})),
        })
      }
      client.on("setOptions", options => {
        prefewCore.updateClientOptions(client.id, options)
      })
      client.on("export", () => prefewCore.exportImagesForClient(client.id))
      client.on("updateImage", payload => {
        const {name, ...properties} = payload
        prefewCore.updateProviderImage(name, properties)
      })
      client.on("disconnect", () => {
        prefewCore.removeClient(client.id)
      })
      prefewCore.addClient(profile)
    })
    this.server.listen(port)
    prefewCore.on("imageAdded", name => {
      const image = prefewCore.images[name]
      for (const client of prefewCore.getClientsByMode("user")) {
        client.socketClient.emit("imageAdded", {
          name,
          codec: image.codec,
          thumbnail: image.thumbnail,
          type: image.type,
        })
      }
    })
  }

}