import * as winston from 'winston';
import * as fs from 'fs'

export function createLogFolderIfNotExist() {
  if (!fs.existsSync('./log')) {
    fs.mkdirSync('./log')
  }
}

export const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: 'log/filelog-info.log',
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: 'log/filelog-error.log',
      level: 'error'
    }),
    new (winston.transports.File)({
      name: 'debug-file',
      filename: 'log/filelog-debug.log',
      level: 'debug'
    })
  ]
});