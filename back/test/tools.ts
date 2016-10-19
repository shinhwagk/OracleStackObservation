import {executeNoLoginShellCommand} from '../src/tools'

console.info(`nc64.exe -w 1 baidu.com 80`)
executeNoLoginShellCommand(`nc64.exe -v -w 4 127.0.0.1 -z 801`).then(console.info)