import * as winston from 'winston';
import * as fs from 'fs'

if (fs.existsSync('./log')) {
  console.info("log dir exists")
} else {
  fs.mkdirSync('./log')
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
    })
  ]
});
