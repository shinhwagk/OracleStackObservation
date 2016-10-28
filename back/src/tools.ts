import * as md_cp from "child_process";
import * as md_ssh2 from "ssh2";
import * as fs from "fs";
import {logger} from "./logger";
import {getCodeByAlert} from "./conf";
import {ShellAlert} from "./alert";
import {OSConnect} from "./ssh";

export function readFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err: NodeJS.ErrnoException, data: Buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  })
}

export function threeMapToArray(map: Map<string, Map<string, Map<string, string>>>) {
  return Array.from(map).map(([l, v]) => [l, Array.from(v).map(([kk, vv]) => [kk, Array.from(vv)])])
}
// export function readMonitorFile(monitor: Report): Promise<string> {
//   let path: string
//   if (monitor.category === 'oracle') {
//     path = `conf/reports/oracle/${monitor.name}.sql`
//   } else {
//     path = `conf/reports/os/${monitor.name}.sh`
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



export async function execAlertRemoteShellCommand(sa: ShellAlert) {
  const code = await getCodeByAlert({category: 'shell', name: sa.name})
  return execRemoteShellCommand(sa.osConnectionInfo, code)
}

export function execRemoteShellCommand(node: { host: string, port: number, username: string, password: string }, shellCommand: string): Promise<string> {
  return new Promise((resolve, reject) => {
    var conn = new md_ssh2.Client();
    conn.on('ready', () => {
      // console.log('Client :: ready');
      conn.exec(shellCommand, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          // console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          conn.end();
        }).on('data', (data) => {
          resolve(data.toString())
        }).stderr.on('data', (data) => reject(data.toString()));
      });
    }).connect({
      host: node.host,
      port: node.port,
      username: node.username,
      password: node.password
    });
  })
}

function scp(osServer: OSConnectionInfo, localFile, remoteFile): Promise<boolean> {
  return new Promise((resolve, reject) => {
    OSConnect(osServer, function (conn) {
      conn.sftp(function (err, sftp) {
        if (err) throw err;
        sftp.fastPut(localFile, remoteFile, (err) => {
          if (err) {
            reject(err)
            console.info(err)
          } else {
            resolve(true)
            conn.end()
          }
        })
      });
    })
  })
}

function execRemoteBaseFile(osServer: OSConnectionInfo, remoteFile): Promise<string> {
  return new Promise((resolve, reject) => {
    OSConnect(osServer, function (conn) {
      conn.exec(`/bin/bash ${remoteFile}`, (err, stream) => {
        if (err) reject(err);
        stream.on('close', (code, signal) => {
          // console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          conn.end();
        }).on('data', (data) => {
          resolve(data.toString())
        }).stderr.on('data', (data) => reject(data.toString()));
      })
    });
  })
}

export async function getOSInfoByName(osServer: OSConnectionInfo, name: string) {
  return new Promise((resolve, reject) => {
    const remoteFile = `/tmp/${name}`
    const localFile = `./conf/reports/os/${name}`
    OSConnect(osServer, (conn) => {
        conn.sftp(function (err, sftp) {
          if (err) throw err;
          sftp.fastPut(localFile, remoteFile, (err) => {
            if (err) {
              console.info(err)
            } else {
              OSConnect(osServer, (conn2) => {
                conn2.exec(`chmod +x ${remoteFile}`, (err, stream) => {
                  stream.on('close', (code, signal) => {
                    console.info("chmod")
                    OSConnect(osServer, (conn3)=> {
                      conn3.exec(`/bin/bash ${remoteFile}`, (err, stream) => {
                          stream.on('close', (code, signal) => {
                            conn.end();
                            conn2.end();
                            conn3.end()
                          }).on('data', (data)=> {
                            resolve(data.toString())
                          }).stderr.on('data', (data) => reject(data.toString()));
                        }
                      )
                    })
                  }).on('data', (data) => {
                    console.info(data.toString())
                  }).stderr.on('data', (data) => reject(data.toString()));
                })
              })
              console.info("sftp")
            }
          })
        })
      }
    )
  })
}


// getOSInfoByName({
//   host: '10.65.193.29',
//   port: 22,
//   username: 'root',
//   password: "oracle"
// }, "disk_space.sh").then(console.info)

export interface OSConnectionInfo {
  host: string
  port: number
  username: string
  password: string
}

export interface OSConnectionInfoForPublicKey {
  host: string
  port: number
  username: string
  privateKey: Buffer
}