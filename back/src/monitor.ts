import * as os from 'os'
import { Node, getNodeConf, getDatabaseConf, Database, readMonitorCode, getMonitorConf, Monitor } from './conf'
import * as md_tools from './tools'
import { CheckInfo, PingDB, CheckQueue, NcDB, NodeDB, PingCheckQueue, NcCheckQueue, CheckStatus, MonitorDB } from './store'
import { DatabaseConnectInfo, fff } from './db'
import { flatten } from './common'
import { execOracleAlert } from './alert'

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

      executeCheckCommand({ args: [ip] }, pingCheckCommand).then(bool => {
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

      executeCheckCommand({ args: [ip, port] }, ncCheckCommand).then(bool => {
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

function platformCheckCommand(win32Fun: (CommandArguments) => string, linuxFun: (CommandArguments) => string, macFun: (CommandArguments) => string) {
  const platform = os.platform()
  if (platform === 'win32') { return win32Fun }
  else if (platform === 'linux') { return linuxFun }
  else if (platform === 'darwin') { return macFun }
  else { throw new Error("no set this platform for nc command: " + platform); }
}

interface CommandArguments { args: Array<number | string> } //0:ip,1:port

function pingWin32Command(ca: CommandArguments) { return `ping -n 2 -w 2 ${ca.args[0]}` }

function pingLinuxCommand(ca: CommandArguments) { return `ping -n 2 -w 2 ${ca.args[0]}` }

function pingMacCommand(ca: CommandArguments) { return `ping -c 2 -t 2 ${ca.args[0]}` }

function ncWin32Command(ca: CommandArguments) { return `nc64.exe -v -w 4 ${ca.args[0]} -z ${ca.args[1]}` }

function ncLinuxCommand(ca: CommandArguments) { return `nc -v -w 4 ${ca.args[0]} -z ${ca.args[1]}` }

function ncMacCommand(ca: CommandArguments) { return `nc -v -z ${ca.args[0]} ${ca.args[1]}` }

export const pingCheckCommand: (commandArguments) => string = platformCheckCommand(pingWin32Command, pingLinuxCommand, pingMacCommand)

export const ncCheckCommand: (commandArguments) => string = platformCheckCommand(ncWin32Command, ncLinuxCommand, ncMacCommand)

export function executeCheckCommand(ca: CommandArguments, f: (commandArguments) => string): Promise<boolean> {
  const command = f(ca)
  return md_tools.executeNoLoginShellCommand(command)
}

export async function oracleMonitorQueue(): Promise<[DatabaseConnectInfo, string, string][]> {
  const monitorConf: Monitor[] = await getMonitorConf()
  const databaseConf: Database[] = await getDatabaseConf()

  const oracleMonitorConf: Monitor[] = monitorConf.filter((m: Monitor) => m.category === 'oracle')

  let monitorCode: string[][] = await Promise.all(monitorConf.map((m: Monitor) => readMonitorCode(m).then(code => [m.name, code])))

  return flatten(databaseConf.filter((db: Database) => db.status).map((db: Database) => oracleMonitorConf.map((m: Monitor) => {
    let dci: DatabaseConnectInfo = { ip: db.ip, port: db.port, service: db.service, user: db.user, password: db.password }
    const code: string = monitorCode.filter(c => c[0] === m.name)[0][1]
    return [dci, m.name, code]
  })))
}

export async function monitorStart(): Promise<void> {
  const omq: [DatabaseConnectInfo, string, string][] = await oracleMonitorQueue()
  omq.forEach((dss: [DatabaseConnectInfo, string, string]) => {
    fff(dss[0], dss[2]).then(rows => {
      if (!MonitorDB.has(dss[0].ip)) {
        MonitorDB.set(dss[0].ip, new Map<string, Map<string, any>>())
      }

      let dbMap: Map<string, Map<string, any>> = MonitorDB.get(dss[0].ip)

      if (!dbMap.has(dss[0].service)) {
        dbMap.set(dss[0].service, new Map<string, any>())
      }
      let monitorMap = dbMap.get(dss[0].service)
      monitorMap.set(dss[1], rows)
    }).catch(e => {

    })
  })
}

let c: [string, string, any][] = []

function aaa(dss: [DatabaseConnectInfo, string, string][], rs): void {
  if (dss.length === 0) {
    c = rs
  } else {
    const ds = dss.pop()
    const dc = ds[0]
    const sql = dc[2]
    const ip = dc.ip
    const service = dc.service
    fff(dc, sql).then(rows => {
      rs.push([ip, service, rows])
      aaa(dss, rs)
    }).catch(e => {
      console.info(e)
      aaa(dss, rs)
    })
  }
}

// oracleMonitorQueue().then(dss => {
//   // console.info(dss)
//   aaa(dss, [])
// })


export const alertDB: Map<string, Map<string, Map<string, any>>> = new Map<string, Map<string, Map<string, any>>>()

export async function alertStart(): Promise<void> {
  const omq: [DatabaseConnectInfo, string, string][] = await oracleMonitorQueue()
  omq.forEach((dss: [DatabaseConnectInfo, string, string]) => {
    fff(dss[0], dss[2]).then(rows => {
      if (!MonitorDB.has(dss[0].ip)) {
        MonitorDB.set(dss[0].ip, new Map<string, Map<string, any>>())
      }

      let dbMap: Map<string, Map<string, any>> = MonitorDB.get(dss[0].ip)

      if (!dbMap.has(dss[0].service)) {
        dbMap.set(dss[0].service, new Map<string, any>())
      }
      let monitorMap = dbMap.get(dss[0].service)
      monitorMap.set(dss[1], rows)
    })
  })
}

function executeCheck() {
  setInterval(() => {
    databasePortCheck()
    nodePingCheck()
    execOracleAlert()
    // monitorStart()

  }, 1000)
}

export async function abc(ctx) {
  const monitors: Monitor[] = await getMonitorConf()
  const b: string[] = await Promise.all(monitors.map(readMonitorCode))
  console.info(ctx.params.ip)
  console.info(ctx.params.service)
  ctx.body = JSON.stringify(md_tools.threeMapToArray(MonitorDB))
}

export function start() { executeCheck() }