import { getMonitorConf, Monitor, getDatabaseConf, Database, getNodeConf, Node } from './conf'
import { DatabaseConnectInfo, xx } from './db'
import { flatten } from './common'
import { AlertOracleDB, replaceData } from './store'
import { OSConnectionInfo, execRemoteShellCommand, execAlertRemoteShellCommand } from './tools'

async function getLinuxAlertQueue() {
  const monitorConf: Monitor[] = await getMonitorConf()
  const monitorConfFilterAlert: Monitor[] = monitorConf.filter((m: Monitor) => m.alert !== undefined && m.category === 'shell')
  const nodes: Node[] = await getNodeConf()

  return flatten(monitorConfFilterAlert.map((m: Monitor) => {
    if (m.alert.include) {
      const i = m.alert.include
      const ns: Node[] = filterShellInclude(nodes, i)
      return genShellAlerts(ns, m)
    } else if (m.alert.exclude) {
      const e: string[][] = m.alert.exclude
      const ns: Node[] = filterShellExclude(nodes, e)
      return genShellAlerts(ns, m)
    } else {
      return genShellAlerts(nodes, m)
    }
  }))
}

async function getOracleAlertQueue(): Promise<DatabaseAlert[]> {
  const monitorConf: Monitor[] = await getMonitorConf()
  const monitorConfFilterAlert: Monitor[] = monitorConf.filter((m: Monitor) => m.alert !== undefined && m.category === 'oracle')
  const databases: Database[] = await getDatabaseConf()

  return flatten(monitorConfFilterAlert.map((m: Monitor) => {
    if (m.alert.include) {
      const i = m.alert.include
      const dss: Database[] = filterOracleInclude(databases, i)
      return genDatabaseAlerts(dss, m)
    } else if (m.alert.exclude) {
      const e: string[][] = m.alert.exclude
      const dss: Database[] = filterOracleExclude(databases, e)
      return genDatabaseAlerts(dss, m)
    } else {
      return genDatabaseAlerts(databases, m)
    }
  }))
}

export interface DatabaseAlert {
  name: string
  ip: string
  service: string
  databaseConnectInfo: DatabaseConnectInfo
}

export interface ShellAlert {
  name: string
  ip: string
  osConnectionInfo: OSConnectionInfo
}

export function execOracleAlert(): void {
  getOracleAlertQueue().then(oaqs => ccc(oaqs, []))
}

export function execShellAlert(): void {
  getLinuxAlertQueue().then()
}

// function bb(shellAlerts: ShellAlert[], array) {
//   if (shellAlerts.length >= 1) {
//     const sa: ShellAlert = shellAlerts.pop()
//     execAlertRemoteShellCommand(sa).then(str => {
//       if (str) {
//         array.push([sa.ip, sa.service, sa.name])
//       }
//       ccc(shellAlerts, array)
//     }).catch(err => {
//       array.push([sa.ip, sa.service, sa.name, err])
//       ccc(shellAlerts, array)
//     })
//   } else {
//     replaceData(AlertOracleDB, array)
//   }
// }

function ccc(databaseAlers: DatabaseAlert[], array) {
  if (databaseAlers.length >= 1) {
    const da: DatabaseAlert = databaseAlers.pop()
    xx(da).then(bool => {
      if (bool) {
        array.push([da.ip, da.service, da.name])
      }
      ccc(databaseAlers, array)
    }).catch(err => {
      array.push([da.ip, da.service, da.name, err])
      ccc(databaseAlers, array)
    })
  } else {
    replaceData(AlertOracleDB, array)
  }
}

function filterOracleExclude(databases: Database[], exclude: string[][]): Database[] {
  return databases.filter((db: Database) =>
    exclude.filter((e: string[]) => db.ip === e[0] && db.service === e[1]).length === 0
  )
}

function filterOracleInclude(databases: Database[], include: string[][]): Database[] {
  return databases.filter((db: Database) =>
    include.filter((e: string[]) => db.ip === e[0] && db.service === e[1]).length >= 1
  )
}

function filterShellExclude(nodes: Node[], exclude: string[][]): Node[] {
  return nodes.filter((n: Node) =>
    exclude.filter((e: string[]) => n.ip === e[0]).length === 0
  )
}

function filterShellInclude(nodes: Node[], exclude: string[][]): Node[] {
  return nodes.filter((n: Node) =>
    exclude.filter((e: string[]) => n.ip === e[0]).length >= 1
  )
}

function genDatabaseAlerts(dss: Database[], m: Monitor): DatabaseAlert[] {
  return dss.map((d: Database) => {
    const dci: DatabaseConnectInfo = { ip: d.ip, port: d.port, service: d.service, user: d.user, password: d.password }
    return { name: m.alert.name, ip: d.ip, service: d.service, databaseConnectInfo: dci }
  })
}

function genShellAlerts(nodes: Node[], m: Monitor): ShellAlert[] {
  return nodes.map((node: Node) => {
    const sa: OSConnectionInfo = { host: node.ip, port: node.port, username: node.username, password: node.password }
    return { name: m.alert.name, ip: node.ip, osConnectionInfo: sa }
  })
}