import renderResize from "src/presets/renderResize"

const size = 28

export default {
  name: `Twitch Emote (${size}p)`,
  render: renderResize({
    size,
    sharpenSigma: 0.6,
  }),
}