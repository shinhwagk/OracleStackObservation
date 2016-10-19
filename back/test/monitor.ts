import {ncCheck,pingCheck} from '../src/monitor'

pingCheck('127.0.0.1').then(console.info)