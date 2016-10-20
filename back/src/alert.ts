import { getMonitorConf, Monitor, getDatabaseConf, Database } from './conf'
import { DatabaseConnectInfo, xx } from './db'
import { flatten } from './common'
import { AlertOracleDB, replaceData } from './store'

async function getOracleAlertQueue(): Promise<DatabaseAlert[]> {
  const monitorConf: Monitor[] = await getMonitorConf()
  const monitorConfFilterAlert: Monitor[] = monitorConf.filter((m: Monitor) => m.alert !== undefined && m.category === 'oracle')
  const databases: Database[] = await getDatabaseConf()

  return flatten(monitorConfFilterAlert.map((m: Monitor) => {
    if (m.alert.include) {
      const i = m.alert.include
      const dss: Database[] = filterInclude(databases, i)
      return genDatabaseAlerts(dss, m)
    } else if (m.alert.exclude) {
      const e: string[][] = m.alert.exclude
      const dss: Database[] = filterExclude(databases, e)
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

export function execOracleAlert(): void {
  getOracleAlertQueue().then(oaqs => ccc(oaqs, []))
}

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

function filterExclude(databases: Database[], exclude: string[][]): Database[] {
  return databases.filter((db: Database) =>
    exclude.filter((e: string[]) => db.ip === e[0] && db.service === e[1]).length === 0
  )
}

function filterInclude(databases: Database[], include: string[][]): Database[] {

  return databases.filter((db: Database) =>
    include.filter((e: string[]) => db.ip === e[0] && db.service === e[1]).length >= 1
  )
}

function genDatabaseAlerts(dss: Database[], m: Monitor): DatabaseAlert[] {
  return dss.map((d: Database) => {
    const dci: DatabaseConnectInfo = { ip: d.ip, port: d.port, service: d.service, user: d.user, password: d.password }
    return { name: m.alert.name, ip: d.ip, service: d.service, databaseConnectInfo: dci }
  })
}