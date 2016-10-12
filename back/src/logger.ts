import * as winston from 'winston';
winston.info("Aaa")
winston.add(winston.transports.File, { filename: 'somefile.log' });
winston.info("Aaa")