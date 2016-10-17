import * as md_conf from '../conf'
import * as md_montior from './test-env-backup'
import * as md_tools from '../common/tools'
import * as md_store from '../store'
import { CommandCheckInfo, PingDB, CheckQueue, NcDB, NodeDB, PingCheckQueue, NcCheckQueue, genNCKey, CheckStatus } from '../store'

async function check(ip: string, port: number): Promise<void> {
  let pingBool = await pingCheck(ip)
  let ncBool = await ncCheck(ip, port)
  PingDB.set(ip, md_tools.commandCheck(pingBool, PingDB.get(ip)))
  NcDB.set(ip, md_tools.commandCheck(ncBool, NcDB.get(ip)))
  return
}

function genCheckQueue() {
  md_conf.getNodeConf().then((nodeConfs: md_conf.NodeConf[]) => {
    nodeConfs.forEach((nodeConf: md_conf.NodeConf) => {
      let ip = nodeConf.ip
      if (nodeConf.status) {
        PingCheckQueue.push(ip)
        PingDB.set(ip, { status: CheckStatus.DOUBT, retry: 0, timestamp: new Date().getTime() })
        nodeConf.databases.forEach((dbs: md_conf.DatabaseConf) => {
          let port = dbs.port
          if (dbs.status) {
            NcCheckQueue.push([genNCKey(ip, dbs.service), [ip, dbs.service, port]])
            NcDB.set(genNCKey(ip, dbs.service), { status: CheckStatus.DOUBT, retry: 0, timestamp: new Date().getTime() })
          } else {
            NcDB.set(genNCKey(ip, dbs.service), { status: md_store.CheckStatus.STOP, retry: 0, timestamp: new Date().getTime() })
          }
        })
      } else {
        PingDB.set(ip, { status: md_store.CheckStatus.STOP, retry: 0, timestamp: new Date().getTime() })
      }
    })
  })
}

function pingCheck(ip: string): Promise<boolean> {
  const command = `ping -c 2 -t 2 ${ip}`
  return md_tools.executeNoLoginShellCommand(command)
}

function ncCheck(ip: string, port: number): Promise<boolean> {
  const command = `nc -v -w 4 ${ip} -z ${port}`
  return md_tools.executeNoLoginShellCommand(command)
}

function executeCheck() {
  setInterval(() => {
    while (PingCheckQueue.length >= 1) {
      let ip: string = PingCheckQueue.shift()
      pingCheck(ip).then(bool => {
        let retry = PingDB.get(ip).retry + 1
        PingDB.set(ip, md_tools.commandCheck(bool, { retry: retry }))
      })
    }
    while (NcCheckQueue.length >= 1) {
      let [key, [ip, service, port]] = NcCheckQueue.shift()
      ncCheck(ip, port).then(bool => {
        let retry = NcDB.get(key).retry + 1
        NcDB.set(genNCKey(ip, service), md_tools.commandCheck(bool, { retry: retry }))
      })
    }
  }, 1000)
}

async function start() {
  setInterval(() => genCheckQueue(), 1000)
  executeCheck()
}

export { start }