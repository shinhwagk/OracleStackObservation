import { Report, getDatabaseConf, DatabaseConf, getNodeConf, NodeConf, getReportConf, AlertConf, getAlertConf, ReportCategory } from './conf';
import { DatabaseConnectInfo, xx } from "./db";
import { flatten } from "./common";
import { AlertOracleDB, replaceData } from "./store";
import { OSConnectionInfo } from "./tools";
import { CronJob } from "cron";

async function getLinuxAlertQueue() {
  const monitorConf: Report[] = await getReportConf()
  const monitorConfFilterAlert: Report[] = monitorConf.filter((m: Report) => m.alert !== undefined && m.category === "shell")
  const nodes: NodeConf[] = await getNodeConf()

  return flatten(monitorConfFilterAlert.map((m: Report) => {
    if (m.alert.include) {
      const i: string[][] = m.alert.include
      const ns: NodeConf[] = filterShellInclude(nodes, i)
      return genOSAlerts(ns, m)
    } else if (m.alert.exclude) {
      const e: string[][] = m.alert.exclude
      const ns: NodeConf[] = filterShellExclude(nodes, e)
      return genOSAlerts(ns, m)
    } else {
      return genOSAlerts(nodes, m)
    }
  }))
}
//A[A[abc().a]] === A[A.a]
export async function getOracleAlertQueue(): Promise<DatabaseAlert[]> {
  const alertConf: AlertConf[] = await getAlertConf()
  const oracleAlertConf: AlertConf[] = alertConf.filter((a: AlertConf) => ReportCategory[ReportCategory[a.category]] === ReportCategory[ReportCategory.DATABASE])
  const databases: DatabaseConf[] = await getDatabaseConf()

  return flatten(oracleAlertConf.map((a: AlertConf) => {
    if (a.include) {
      const dss: DatabaseConf[] = filterOracleInclude(databases, a.include)
      return genDatabaseAlerts(dss, a)
    } else if (a.exclude) {
      const dss: DatabaseConf[] = filterOracleExclude(databases, a.exclude)
      return genDatabaseAlerts(dss, a)
    } else {
      return genDatabaseAlerts(databases, a)
    }
  }))
}

export async function getOracleReportQueue(ip: string, service: string): Promise<string[]> {
  const monitorConf: Report[] = await getReportConf()
  return monitorConf.filter((m: Report) => m.category === 'oracle').map(m => m.name)
}

// export async function getOracleAlertNames(ip: string, service: string): Promise<string[]> {

//   const alertConf: Alert[] = await getAlertConf()
//   return alertConf.filter((a: Alert) => Category[Category[a.category]] === Category[Category.ORACLE]).map(m => m.name)
// }

export async function getOSReportQueue(ip: string) {
  const monitorConf: Report[] = await getReportConf()
  console.info(monitorConf)
  return monitorConf.filter((m: Report) => m.category === 'os').map(m => m.name)
}

export interface DatabaseAlert {
  name: string
  cron: string
  ip: string
  service: string
  databaseConnectInfo: DatabaseConnectInfo
}

export interface OSAlert {
  name: string
  ip: string
  osConnectionInfo: OSConnectionInfo
}

export function execOracleAlert(): void {
  getOracleAlertQueue().then(oaqs => oaqs.forEach(abc))
}

// export function execOSAlert(): void {
//   getLinuxAlertQueue().then(abc)
// }

// function bb(OSAlerts: OSAlert[], array) {
//   if (OSAlerts.length >= 1) {
//     const sa: OSAlert = OSAlerts.pop()
//     execAlertRemoteShellCommand(sa).then(str => {
//       if (str) {
//         array.push([sa.ip, sa.service, sa.name])
//       }
//       ccc(OSAlerts, array)
//     }).catch(err => {
//       array.push([sa.ip, sa.service, sa.name, err])
//       ccc(OSAlerts, array)
//     })
//   } else {
//     replaceData(AlertOracleDB, array)
//   }
// }

// function ccc(databaseAlers: DatabaseAlert[], array) {
//   if (databaseAlers.length >= 1) {
//     const da: DatabaseAlert = databaseAlers.pop()
//   //   xx(da).then(bool => {
//   //     if (bool) {
//   //       array.push([da.ip, da.service, da.name])
//   //     }
//   //     ccc(databaseAlers, array)
//   //   }).catch(err => {
//   //     array.push([da.ip, da.service, da.name, err])
//   //     ccc(databaseAlers, array)
//   //   })
//   // } else {
//   //   replaceData(AlertOracleDB, array)
//   // }
// }

function filterOracleExclude(databases: DatabaseConf[], exclude: string[][]): DatabaseConf[] {
  return databases.filter((db: DatabaseConf) =>
    exclude.filter((e: string[]) => db.ip === e[0] && db.service === e[1]).length === 0
  )
}

function filterOracleInclude(databases: DatabaseConf[], include: string[][]): DatabaseConf[] {
  return databases.filter((db: DatabaseConf) =>
    include.filter((e: string[]) => db.ip === e[0] && db.service === e[1]).length >= 1
  )
}

function filterShellExclude(nodes: NodeConf[], exclude: string[][]): NodeConf[] {
  return nodes.filter((n: NodeConf) =>
    exclude.filter((e: string[]) => n.ip === e[0]).length === 0
  )
}

function filterShellInclude(nodes: NodeConf[], exclude: string[][]): NodeConf[] {
  return nodes.filter((n: NodeConf) =>
    exclude.filter((e: string[]) => n.ip === e[0]).length >= 1
  )
}

function genDatabaseAlerts(dss: DatabaseConf[], a: AlertConf): DatabaseAlert[] {
  return dss.map((d: DatabaseConf) => {
    const dci: DatabaseConnectInfo = { ip: d.ip, port: d.port, service: d.service, user: d.user, password: d.password }
    return { name: a.name, cron: a.cron, ip: d.ip, service: d.service, databaseConnectInfo: dci }
  })
}

function genOSAlerts(nodes: NodeConf[], m: Report): OSAlert[] {
  return nodes.map((node: NodeConf) => {
    const sa: OSConnectionInfo = { host: node.ip, port: node.port, username: node.username, password: node.password }
    return { name: m.alert.name, ip: node.ip, osConnectionInfo: sa }
  })
}

function abc(da: DatabaseAlert) {
  const key = `${da.ip}-${da.service}-${da.name}`
  console.info(key, "    11")
  console.info(da.cron)
  if (!AlertCronDB.has(key)) {
    const cronObj: CronJob = new CronJob(da.cron, () => {
      xx(da).then(bool => AlertDB.set(key, bool))
      console.info("cron: " + key + " " + new Date() + " " + da.cron)

    }, null, true);
    AlertCronDB.set(key, [cronObj])
  }
}

export const AlertCronDB = new Map<string, CronJob[]>()
export const AlertDB = new Map<string, boolean>()