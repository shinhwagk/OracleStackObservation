import * as os from "os";
import {getDatabaseConf, Database, getCodeByReport, Report, getDatabase, getNodeByIp, getNodeConf, getReportConf} from "./conf";
import * as md_tools from "./tools";
import {getOSInfoByName} from "./tools";
import {MonitorDB, CheckStatus, CheckInfo, PingCheckDB, NetCatCheckDB} from "./store";
import {DatabaseConnectInfo, fff} from "./db";
import {flatten} from "./common";

export enum CheckType{
  PING,
  NETCAT
}

function initDB(key, db) {
  if (!db.has(key)) {
    db.set(key, {status: CheckStatus.DOUBT, timestamp: new Date().getTime(), retry: 0})
  }
}

export function makeKey(l: {type: CheckType,args: CommandArguments}): string {
  if (l.type === CheckType.PING) {
    return `${CheckType.PING}_${l.args.args[0]}`
  } else {
    return `${CheckType.NETCAT}_${l.args.args[0]}_${l.args.args[1]}`
  }
}

export function executeCheck(arr, f, f2, db) {
  arr.then(f).then((list: {type: CheckType,status: boolean,args: CommandArguments}[])=> {
    list.forEach(l=> {
      const key = makeKey(l)
      initDB(key, db)
      if (l.status) {
        executeCheckCommand(l.args, f2).then(bool=> checkItemStatusVerify(bool, key,db)).catch(console.info)
      } else {
        db.set(key, {status: CheckStatus.STOP, timestamp: new Date().getTime()})
      }
    })
  })
}

function executePingCheck() {
  executeCheck(getNodeConf(), (ns) => {
    return ns.map(n=> {
      return {type: CheckType.PING, status: n.status, args: {args: [n.ip]}}
    })
  }, pingCheckCommand, PingCheckDB)
}

function executeNcCheck() {
  executeCheck(getDatabaseConf(), (ns) => {
    return ns.map(n=> {
      return {type: CheckType.NETCAT, status: n.status, args: {args: [n.ip, n.port]}}
    })
  }, ncCheckCommand, NetCatCheckDB)
}

export function executeAllCheck() {
  executePingCheck()
  executeNcCheck()
}


// export function executeCheck(): void {
//   getCheckList().then((list: {type: CheckType,status: boolean,args: CommandArguments}[])=> {
//     list.forEach(l=> {
//       const key = makeKey(l.type, l.args)
//       initDB(key)
//       if (l.status) {
//         if (l.type === CheckType.PING) {
//           executeCheckCommand(l.args, pingCheckCommand).then(bool=> checkItemStatusVerify(bool, key)).catch(console.info)
//         } else if (l.type === CheckType.NETCAT) {
//           executeCheckCommand(l.args, ncCheckCommand).then(bool=>checkItemStatusVerify(bool, key))
//         }
//       } else {
//         CheckDB.set(key, {status: CheckStatus.STOP, timestamp: new Date().getTime()})
//       }
//     })
//   }).catch(console.info)
// }

function checkItemStatusVerify(bool: boolean, key: string,db) {
  console.info(db,1111111)
  const ci: CheckInfo = db.get(key)
  const status: CheckStatus = ci.status
  const timestamp: number = ci.timestamp + 1000 * 5
  const currTimestamp: number = new Date().getTime()
  if (status === CheckStatus.DOUBT || status === CheckStatus.NORMAL || (status === CheckStatus.DIE && timestamp < currTimestamp)) {
    db.set(key, verifyCheckStatus(bool, ci))
  }
}

function verifyCheckStatus(currStatus: boolean, cci: CheckInfo): CheckInfo {
  if (currStatus) {
    return {timestamp: new Date().getTime(), status: CheckStatus.NORMAL, retry: 0}
  } else {
    if (cci.retry >= 5) {
      return {timestamp: new Date().getTime(), status: CheckStatus.DIE, retry: 0}
    } else {
      return {timestamp: new Date().getTime(), status: CheckStatus.DOUBT, retry: cci.retry + 1}
    }
  }
}

async function getCheckList(): Promise<{type: CheckType,status: boolean,args: CommandArguments}[]> {
  const monitors: {type: CheckType,status: boolean,args: CommandArguments}[] = []
  const nodesConf = await getNodeConf()
  const databasesConf = await getDatabaseConf()
  nodesConf.forEach(nc => monitors.push({type: CheckType.PING, status: nc.status, args: {args: [nc.ip]}}))
  databasesConf.forEach(dc => monitors.push({
    type: CheckType.NETCAT,
    status: dc.status,
    args: {args: [dc.ip, dc.port]}
  }))
  return monitors
}

function platformCheckCommand(win32Fun: (CommandArguments) => string, linuxFun: (CommandArguments) => string, macFun: (CommandArguments) => string) {
  const platform = os.platform()
  if (platform === 'win32') {
    return win32Fun
  }
  else if (platform === 'linux') {
    return linuxFun
  }
  else if (platform === 'darwin') {
    return macFun
  }
  else {
    throw new Error("no set this platform for nc command: " + platform);
  }
}

interface CommandArguments { args: Array<number | string>
} //0:ip,1:port

function pingWin32Command(ca: CommandArguments) {
  return `ping -n 2 -w 2 ${ca.args[0]}`
}

function pingLinuxCommand(ca: CommandArguments) {
  return `ping -n 2 -w 2 ${ca.args[0]}`
}

function pingMacCommand(ca: CommandArguments) {
  return `ping -c 2 -t 2 ${ca.args[0]}`
}

function ncWin32Command(ca: CommandArguments) {
  return `nc64.exe -v -w 4 ${ca.args[0]} -z ${ca.args[1]}`
}

function ncLinuxCommand(ca: CommandArguments) {
  return `nc -v -w 4 ${ca.args[0]} -z ${ca.args[1]}`
}

function ncMacCommand(ca: CommandArguments) {
  return `nc -v -z ${ca.args[0]} ${ca.args[1]}`
}

export const pingCheckCommand: (commandArguments) => string = platformCheckCommand(pingWin32Command, pingLinuxCommand, pingMacCommand)

export const ncCheckCommand: (commandArguments) => string = platformCheckCommand(ncWin32Command, ncLinuxCommand, ncMacCommand)

export function executeCheckCommand(ca: CommandArguments, f: (commandArguments) => string): Promise<boolean> {
  const command = f(ca)
  return md_tools.executeNoLoginShellCommand(command)
}

export async function oracleReportQueue(): Promise<[DatabaseConnectInfo, string, string][]> {
  const reportConf: Report[] = await getReportConf()
  const databaseConf: Database[] = await getDatabaseConf()

  const oracleMonitorConf: Report[] = reportConf.filter((m: Report) => m.category === 'oracle')

  let monitorCode: string[][] = await Promise.all(reportConf.map((m: Report) => getCodeByReport(m).then(code => [m.name, code])))

  return flatten(databaseConf.filter((db: Database) => db.status).map((db: Database) => oracleMonitorConf.map((m: Report) => {
    let dci: DatabaseConnectInfo = {ip: db.ip, port: db.port, service: db.service, user: db.user, password: db.password}
    const code: string = monitorCode.filter(c => c[0] === m.name)[0][1]
    return [dci, m.name, code]
  })))
}

// export async function monitorStart(): Promise<void> {
//   const omq: [DatabaseConnectInfo, string, string][] = await oracleReportQueue()
//   omq.forEach((dss: [DatabaseConnectInfo, string, string]) => {
//     fff(dss[0], dss[2]).then(rows => {
//       if (!MonitorDB.has(dss[0].ip)) {
//         MonitorDB.set(dss[0].ip, new Map<string, Map<string, any>>())
//       }
//
//       let dbMap: Map<string, Map<string, any>> = MonitorDB.get(dss[0].ip)
//
//       if (!dbMap.has(dss[0].service)) {
//         dbMap.set(dss[0].service, new Map<string, any>())
//       }
//       let monitorMap = dbMap.get(dss[0].service)
//       monitorMap.set(dss[1], rows)
//     }).catch(e => {
//
//     })
//   })
// }

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

// oracleReportQueue().then(dss => {
//   // console.info(dss)
//   aaa(dss, [])
// })


// export const alertDB: Map<string, Map<string, Map<string, any>>> = new Map<string, Map<string, Map<string, any>>>()

export async function alertStart(): Promise<void> {
  const omq: [DatabaseConnectInfo, string, string][] = await oracleReportQueue()
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

export function startCheck() {
  setInterval(() => {
    // databasePortCheck()
    // nodePingCheck()
    executeAllCheck()
    // execOracleAlert()
    // monitorStart()
  }, 5000)
}

export async function abc(ctx) {
  const monitors: Report[] = await getReportConf()
  const b: string[] = await Promise.all(monitors.map(getCodeByReport))
  console.info(ctx.params.ip)
  console.info(ctx.params.service)
  ctx.body = JSON.stringify(md_tools.threeMapToArray(MonitorDB))
}

export async function reportOracleMonitorByName(ctx) {
  const sql: string = await getCodeByReport({name: ctx.params.name, category: "oracle"})
  console.info(sql)
  const dbconf = await getDatabase(ctx.params.ip, ctx.params.service)
  ctx.type = 'application/json';
  ctx.body = JSON.stringify(await fff({
    ip: dbconf.ip,
    port: dbconf.port,
    service: dbconf.service,
    user: dbconf.user,
    password: dbconf.password
  }, sql))
}

export async function reportOSMonitorByName(ctx) {
  console.info(ctx.params.name)
  const node = await getNodeByIp(ctx.params.ip)
  console.info(node)
  ctx.type = 'application/json';
  ctx.body = await getOSInfoByName({
    host: node.ip,
    port: node.port,
    username: node.username,
    password: node.password
  }, ctx.params.name + ".sh")
}