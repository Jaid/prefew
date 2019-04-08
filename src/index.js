/** @module prefew */

import path from "path"

import {getConfigHome} from "platform-folders"
import {noop} from "lodash"
import winston from "winston"
import yargs from "yargs"
import sharp from "sharp"

import formatter from "./logFormatter"
import PrefewCore from "./PrefewCore"

sharp.cache(false)

const configDirectory = path.join(getConfigHome(), _PKG_NAME)

const log = winston.createLogger({
  format: formatter(),
  transports: [new winston.transports.Console()],
})

log.info(`Config directory: ${configDirectory}`)

const job = () => {
  const prefewCore = new PrefewCore({
    directory: configDirectory,
  })
  prefewCore.setup()
}

yargs
  .command("$0", "Starts prefew server", noop, job)
  .version(_PKG_VERSION)
  .argv