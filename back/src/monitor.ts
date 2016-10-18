import * as os from 'os'
import { Node, getNodeConf, getDatabaseConf, Database, readMonitorCode, getMonitorConf, Monitor } from './conf'
import * as md_tools from './tools'
import { CheckInfo, PingDB, CheckQueue, NcDB, NodeDB, PingCheckQueue, NcCheckQueue, CheckStatus } from './store'

function genCheckQueue() {
  getDatabaseConf().then((dcs: Database[]) => {
    dcs.forEach((dc: Database) => {
      const ip = dc.ip
      const port = dc.port
      const key = `${ip}_${port}`

      if (!NcDB.has(key)) {
        if (dc.status) {
          NcDB.set(key, { status: CheckStatus.DOUBT, timestamp: new Date().getTime(), retry: 0 })
        } else {
          NcDB.set(key, { status: CheckStatus.STOP, timestamp: new Date().getTime() })
        }
      }

      const ci: CheckInfo = NcDB.get(key)
      const status: CheckStatus = ci.status
      const timestamp: number = ci.timestamp + 1000 * 5
      const currTimestamp: number = new Date().getTime()
      if (status === CheckStatus.DOUBT || status === CheckStatus.NORMAL || (status === CheckStatus.DIE && timestamp < currTimestamp)) {
        // NcCheckQueue.push([ip, port])
        ncCheck(ip, port).then(bool => {
          let cci = NcDB.get(`${ip}_${port}`)
          if (cci.status !== CheckStatus.DIE)
            NcDB.set(`${ip}_${port}`, md_tools.verifyCheckInfo(bool, cci))
        })
      }
    })
  })
}

function nodePingCheck() {
  getNodeConf().then((ncs: Node[]) => {
    ncs.forEach((nc: Node) => {
      const ip = nc.ip

      if (!PingDB.has(ip)) {
        if (nc.status) {
          PingDB.set(ip, { status: CheckStatus.DOUBT, timestamp: new Date().getTime(), retry: 0 })
        } else {
          PingDB.set(ip, { status: CheckStatus.STOP, timestamp: new Date().getTime() })
        }
      }

      pingCheck(ip).then(bool => {
        const ci: CheckInfo = PingDB.get(ip)
        const status: CheckStatus = ci.status
        const timestamp: number = ci.timestamp + 1000 * 5
        const currTimestamp: number = new Date().getTime()
        if (status === CheckStatus.DOUBT || status === CheckStatus.NORMAL || (status === CheckStatus.DIE && timestamp < currTimestamp))
          PingDB.set(ip, md_tools.verifyCheckInfo(bool, ci))
      }).catch(console.info)
    })
  })
}

function databasePortCheck() {
  getDatabaseConf().then((dcs: Database[]) => {
    dcs.forEach((dc: Database) => {
      const ip = dc.ip
      const port = dc.port
      const key = `${ip}_${port}`

      if (!NcDB.has(key)) {
        if (dc.status) {
          NcDB.set(key, { status: CheckStatus.DOUBT, timestamp: new Date().getTime(), retry: 0 })
        } else {
          NcDB.set(key, { status: CheckStatus.STOP, timestamp: new Date().getTime() })
        }
      }

      ncCheck(ip, port).then(bool => {
        const ci: CheckInfo = NcDB.get(key)
        const status: CheckStatus = ci.status
        const timestamp: number = ci.timestamp + 1000 * 5
        const currTimestamp: number = new Date().getTime()
        if (status === CheckStatus.DOUBT || status === CheckStatus.NORMAL || (status === CheckStatus.DIE && timestamp < currTimestamp))
          NcDB.set(`${ip}_${port}`, md_tools.verifyCheckInfo(bool, ci))
      }).catch(console.info)
    })
  })
}

function genPingCheckFun(): (string) => Promise<boolean> {
  function genPingCommandFun() {
    const platform = os.platform()
    if (platform === 'darwin') {
      return function (ip: string) { return `ping -c 2 -t 2 ${ip}` }
    }
    else if (platform === 'linux') {
      return function (ip: string) { return `ping -c 2 -W 2 ${ip}` }
    } else {
      throw new Error("no set this platform for ping command: " + platform);
    }
  }
  
  let genPingCommand: (string) => string = genPingCommandFun()

  return function (ip: string) {
    const command: string = genPingCommand(ip)
    return md_tools.executeNoLoginShellCommand(command)
  }
}

const pingCheck = genPingCheckFun()

function ncCheck(ip: string, port: number): Promise<boolean> {
  const command = `nc -v -w 4 ${ip} -z ${port}`
  return md_tools.executeNoLoginShellCommand(command)
}

function executeCheck() {
  setInterval(() => {
    databasePortCheck()
    nodePingCheck()
    // console.info(NcDB)
    // console.info(PingDB)
  }, 1000)
}

export async function abc(ctx) {
  const monitors: Monitor[] = await getMonitorConf()
  const b: string[] = await Promise.all(monitors.map(readMonitorCode))
  ctx.body = b
}

export function start() { executeCheck() }