import * as md_cp from 'child_process';
import * as md_ssh2 from 'ssh2'

import { CommandCheckInfo, CheckStatus } from '../store'

// bug :(node:11849) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 3): TypeError: Cannot read property '2' of undefined   
export function executeNoLoginShellCommand(command: string): Promise<boolean> {
  let pro = new Promise((resolve, reject) => {
    md_cp.exec(command, (error, stdout, stderr) => {
      if (error) {
        // console.info(`${command} failure.`)
        resolve(false)
      } else {
        // console.info(`${command} success.`)
        resolve(true)
      }
    })
  })
  return pro
}

function commandCheck(currStatus: boolean, cci: CommandCheckInfo): CommandCheckInfo {
  if (currStatus) {
    return { timestamp: new Date().getTime(), status: CheckStatus.NORMAL, retry: 0 }
  } else {
    if (cci.retry > 5) {
      return { timestamp: new Date().getTime(), status: CheckStatus.DIE, retry: 0 }
    } else {
      return { timestamp: new Date().getTime(), status: CheckStatus.DOUBT, retry: cci.retry + 1 }
    }
  }
}

function pingCheck(ip: string): Promise<boolean> { return executeNoLoginShellCommand(`ping -c 2 ${ip}`) }

function portCheck(ip: string, port: number): Promise<boolean> { return executeNoLoginShellCommand(`nc -v -w 4 ${ip} -z ${port}`) }

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


// function getCurrentTimestamp(): number {
//   let date = new Date()
//   let year = pad(date.getFullYear(), 4)
//   let mon = pad(date.getMonth() + 1, 2)
//   let day = pad(date.getDay(), 2)
//   let hour = pad(date.getHours(), 2)
//   let min = pad(date.getMinutes(), 2)
//   let sec = pad(date.getSeconds(), 2)
//   let mis = pad(date.getMilliseconds(), 3)
//   return Number(`${year}${mon}${day}${hour}${min}${sec}${mis}`)
// }

// function pad(num, size) {
//   let s: string = num.toString();
//   while (s.length < size) s = "0" + s;
//   return s;
// }

export { pingCheck, portCheck, execRemoteShellCommand, commandCheck }
//test
// execRemoteShellCommand({ ip: "10.65.193.39", port: 22, username: "root", password: "oracle" }, "df -hP | grep -v Filesystem").then(console.info)
// execRemoteShellCommand({ ip: "10.65.193.39", port: 22, username: "root", password: "oracle" }, "hostname").then(console.info)