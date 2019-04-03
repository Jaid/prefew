import {configureCli} from "webpack-config-jaid"

export default configureCli({
  publishimo: {fetchGithub: true},
  extra: {
    module: {
      rules: [
        {
          test: /\.(png)$/,
          use: {
            loader: "file-loader",
            options: {
              name: process.env.NODE_ENV === "production" ? "[hash:base62:8].[ext]" : "[path][name].[ext]",
            },
          },
        },
      ],
    },
  },
})