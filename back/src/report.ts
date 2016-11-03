import * as os from "os";
import {getDatabaseConf, Database, getCodeByReport, Report, getDatabase, getNodeByIp, getNodeConf, getReportConf} from "./conf";
import * as md_tools from "./tools";
import {getOSInfoByName} from "./tools";
import {MonitorDB, CheckStatus, CheckInfo, NodeCheckDB, PortCheckDB} from "./store";
import {DatabaseConnectInfo, sqlToArray} from "./db";
import {flatten} from "./common";
import * as cron from "cron";

export enum CheckType {
  PING,
  PORT
}

// function appendDB(key, db) {
//   if (!db.has(key)) {
//     db.set(key, {status: CheckStatus.DOUBT, timestamp: new Date().getTime(), retry: 0})
//   }
// }


export function makeKey(type: CheckType, ca: CommandArguments): string {
  if (type === CheckType.PING) {
    return `${CheckType.PING}_${ca.args[0]}`
  } else {
    return `${CheckType.PORT}_${ca.args[0]}_${ca.args[1]}`
  }
}

// export function executeCheck(checkList: any[], makeCheckCommand, checkDB, self) {
//   // checkList.filter(list=>list.)
//
//   if (checkList.length >= 1) {
//     const l: {type: CheckType,status: boolean,args: CommandArguments} = checkList.pop()
//     console.info(l)
//     const key = ""
//
//     appendDB(key, checkDB)
//
//     if (l.status) {
//       const ci: CheckInfo = checkDB.get(key)
//       const status: CheckStatus = ci.status
//       const timestamp: number = ci.timestamp + 1000 * 10
//       const currTimestamp: number = new Date().getTime()
//       if (status === CheckStatus.DOUBT || status === CheckStatus.NORMAL || (status === CheckStatus.DIE && timestamp < currTimestamp)) {
//         executeCheckCommand(l.args, makeCheckCommand).then(bool=> {
//           checkDB.set(key, verifyCheckStatus(bool, checkDB.get(key)))
//           executeCheck(checkList, makeCheckCommand, checkDB, self)
//         })
//       } else {
//         executeCheck(checkList, makeCheckCommand, checkDB, self)
//       }
//     } else {
//       checkDB.set(key, {status: CheckStatus.STOP, timestamp: new Date().getTime()})
//       executeCheck(checkList, makeCheckCommand, checkDB, self)
//     }
//   } else {
//     self()
//   }
// }

async function removeDBByCheckConf(checkDB, checkConf) {
  let checkList = (await getNodeConf()).map((n) => {
    return { type: CheckType.PING, status: n.status, args: { args: [n.ip] } }
  })

  const b = []
  for (let cc of checkConf) {
    for (let [k, v] of checkDB) {
      cc.ip !== k
      b.push(k)
    }
  }
  b.forEach(key => checkDB.delete(key))
}

async function xxx(checkConf, checkType, makeCheckCommand, makeCheckArgs, db) {
  let checkConfList = await checkConf()
  let checkList: CommandArguments[] = []
  let noCheckList: CommandArguments[] = []
  for (let checkConf of checkConfList) {
    const newCheckConf: CommandArguments = makeCheckArgs(checkConf)
    const key: string = makeKey(checkType, newCheckConf)
    if (checkConf.status) {
      if (db.has(key)) {
        const cci = db.get(key)
        if (cci.status === CheckStatus.DOUBT || cci.status === CheckStatus.NORMAL || (cci.status === CheckStatus.DIE && ((cci.timestamp + 1000 * 60 * 5) < new Date().getTime()))) {
          checkList.push(newCheckConf)
        }
      } else {
        checkList.push(newCheckConf)
      }
    } else {
      noCheckList.push(newCheckConf)
    }
  }

  let mmm: Promise<[string, boolean]>[] = checkList.map(args => executeCheckCommand(args, makeCheckCommand).then(bool => {
    return [makeKey(checkType, args), bool]
  }))

  noCheckList.forEach(c => {
    const key = makeKey(checkType, c)
    db.set(key, { status: CheckStatus.STOP, timestamp: new Date().getTime() })
  })

  const bbb: [string, boolean][] = await Promise.all(mmm)

  bbb.forEach(c => verifyCheckStatus2(c[0], c[1], db))
}

function verifyCheckStatus2(key: string, currStatus: boolean, db): void {
  if (currStatus) {
    db.set(key, { timestamp: new Date().getTime(), status: CheckStatus.NORMAL, retry: 0 })
  } else {
    if (db.has(key)) {
      const cci = db.get(key)
      if (cci.retry >= 5) {
        db.set(key, { timestamp: new Date().getTime(), status: CheckStatus.DIE, retry: 0 })
      } else {
        // console.info(cci.retry)
        db.set(key, { timestamp: new Date().getTime(), status: CheckStatus.DOUBT, retry: cci.retry + 1 })
      }
    } else {
      db.set(key, { timestamp: new Date().getTime(), status: CheckStatus.DOUBT, retry: 3 })
    }
  }
}

function verifyCheckStatus(currStatus: boolean, cci: CheckInfo): CheckInfo {
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


// export async function executeNodeCheck(): Promise<void> {
//   let checkList = (await getNodeConf()).map((n) => {
//     return {type: CheckType.PING, status: n.status, args: {args: [n.ip]}}
//   })
//
//   removeDBByCheckConf(NodeCheckDB, getNodeConf())
//   executeCheck(checkList, pingCheckCommand, NodeCheckDB, executeNodeCheck)
// }
//
// async function executePortCheck(): Promise<void> {
//   const checkList = (await getDatabaseConf()).map((d) => {
//     return {type: CheckType.PORT, status: d.status, args: {args: [d.ip, d.port]}}
//   })
//
//   executeCheck(checkList, ncCheckCommand, PortCheckDB, executePortCheck)
// }

function checkItemStatusVerify(bool: boolean, key: string, DB) {
  DB.set(key, verifyCheckStatus(bool, DB.get(key)))
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

interface CommandArguments {
  args: Array<number | string>
} //0:ip,1:port

function pingWin32Command(ca: CommandArguments) {
  return `ping -n 2 -w 2 ${ca.args[0]}`
}

function pingLinuxCommand(ca: CommandArguments) {
  return `ping -c 2 ${ca.args[0]}`
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

type xxxx = string[]

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
    let dci: DatabaseConnectInfo = {
      ip: db.ip,
      port: db.port,
      service: db.service,
      user: db.user,
      password: db.password
    }
    const code: string = monitorCode.filter(c => c[0] === m.name)[0][1]
    return [dci, m.name, code]
  })))
}

// export async function monitorStart(): Promise<void> {
//   const omq: [DatabaseConnectInfo, string, string][] = await oracleReportQueue()
//   omq.forEach((dss: [DatabaseConnectInfo, string, string]) => {
//     sqlToArray(dss[0], dss[2]).then(rows => {
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
    sqlToArray(dc, sql).then(rows => {
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
    sqlToArray(dss[0], dss[2]).then(rows => {
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
  // executeNodeCheck()
  // executePortCheck()
  // setInterval(() => {
  //   // executeNodeCheck()
  //   // executePortCheck()
  //   console.info(NodeCheckDB)
  // }, 1000)
}

export async function abc(ctx) {
  const monitors: Report[] = await getReportConf()
  const b: string[] = await Promise.all(monitors.map(getCodeByReport))
  console.info(ctx.params.ip)
  console.info(ctx.params.service)
  ctx.body = JSON.stringify(md_tools.threeMapToArray(MonitorDB))
}

export async function reportOracleMonitorByName(ctx) {
  const sql: string = await getCodeByReport({ name: ctx.params.name, category: "oracle" })
  const dbconf = await getDatabase(ctx.params.ip, ctx.params.service)
  ctx.type = 'application/json';
  ctx.body = JSON.stringify(await sqlToArray({
    ip: dbconf.ip,
    port: dbconf.port,
    service: dbconf.service,
    user: dbconf.user,
    password: dbconf.password
  }, sql))
}

export async function reportOSMonitorByName(ctx) {
  const node = await getNodeByIp(ctx.params.ip)
  ctx.type = 'application/json';
  ctx.body = await getOSInfoByName({
    host: node.ip,
    port: node.port,
    username: node.username,
    password: node.password
  }, ctx.params.name + ".sh")
}

// xxx(getNodeConf, CheckType.PING, pingCheckCommand, (n)=>[n.ip]).then(console.info)
function nodeCheckExecute() {
  xxx(getNodeConf, CheckType.PING, pingCheckCommand, (n) => {
    return { args: [n.ip] }
  }, NodeCheckDB)
}

function portCheckExecute() {
  xxx(getDatabaseConf, CheckType.PORT, ncCheckCommand, (n) => {
    return { args: [n.ip, n.port] }
  }, PortCheckDB)
}

// portCheckExecute().then(console.info)
// xxx(getNodeConf, CheckType.PING, pingCheckCommand, (n)=>[n.ip]).then(console.info)
// xxx(getDatabaseConf, ncCheckCommand, (n)=>[n.ip, n.port]).then(console.info)

nodeCheckExecute()
portCheckExecute()

// setInterval(()=> {
//   nodeCheckExecute()
//   portCheckExecute()
//   // console.info(NodeCheckDB)
//   // console.info(PortCheckDB)
// }, 10000)

new cron.CronJob('0 */1 * * * *', () => {
  nodeCheckExecute()
  portCheckExecute()
  console.log('You will see this message every second');
}, null, true);