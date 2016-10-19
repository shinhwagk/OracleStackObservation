import * as md_cp from 'child_process';
import * as md_ssh2 from 'ssh2'
import * as fs from 'fs';
import { logger } from './logger'
import { Monitor } from './conf'
import { CheckInfo, CheckStatus } from './store'

export function readFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err: NodeJS.ErrnoException, data: Buffer) => {
      if (err) { reject(err); } else { resolve(data); }
    })
  })
}

export function threeMapToArray(map: Map<string, Map<string, Map<string, string>>>) {
  return Array.from(map).map(([l, v]) => [l, Array.from(v).map(([kk, vv]) => [kk, Array.from(vv)])])
}
// export function readMonitorFile(monitor: Monitor): Promise<string> {
//   let path: string
//   if (monitor.category === 'oracle') {
//     path = `conf/monitors/oracle/${monitor.name}.sql`
//   } else {
//     path = `conf/monitors/os/${monitor.name}.sh`
//   }

//   return new Promise((resolve, reject) => {
//     fs.readFile(path, 'utf-8', (err: NodeJS.ErrnoException, data: Buffer) => {
//       if (err) { reject(err); } else { resolve(data); }
//     })
//   })
// }

export function executeNoLoginShellCommand(command: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    md_cp.exec(command, (error, stdout, stderr) => {
      if (error) {
        logger.error(`${command} failure.`)
        resolve(false)
      } else {
        // console.info(`${command} success.`)
        resolve(true)
      }
    })
  })
}

function verifyCheckInfo(currStatus: boolean, cci: CheckInfo): CheckInfo {
  if (currStatus) {
    return { timestamp: new Date().getTime(), status: CheckStatus.NORMAL, retry: 0 }
  } else {
    if (cci.retry >= 5) {
      return { timestamp: new Date().getTime(), status: CheckStatus.DIE, retry: 0 }
    } else {
      return { timestamp: new Date().getTime(), status: CheckStatus.DOUBT, retry: cci.retry + 1 }
    }
  }
}

function execRemoteShellCommand(node: { ip: string, port: number, username: string, password: string }, shellCommand: string): Promise<string> {
  return new Promise((resolve, reject) => {
    var conn = new md_ssh2.Client();
    conn.on('ready', () => {
      // console.log('Client :: ready');
      conn.exec(shellCommand, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          // console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          conn.end();
        }).on('data', (data) => resolve(data.toString()))
          .stderr.on('data', (data) => reject(data.toString()));
      });
    }).connect({
      host: node.ip,
      port: node.port,
      username: node.username,
      password: node.password
    });
  })
}

export { execRemoteShellCommand, verifyCheckInfo }