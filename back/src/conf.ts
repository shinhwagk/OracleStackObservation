import {flatten} from "./common";
import {readFile} from "./tools";

export function getNodeConf(): Promise<Node[]> {
  return readFile('./conf/nodes.json').then(JSON.parse)
}

export function getReportConf(): Promise<Report[]> {
  return readFile('./conf/reports.json').then(JSON.parse)
}

export function getAlertConf(): Promise<Alert[]> {
  return readFile('./conf/alerts.json').then(JSON.parse)
}

export function getCodeByReport(report: Report): Promise<string> {
  if (report.category === 'oracle') {
    return readFile(`./conf/reports/oracle/${report.name}.sql`)
  } else if (report.category === 'os') {
    return readFile(`./conf/reports/os/${report.name}.sh`)
  }
}

export function getCodeByAlert(alert: Alert): Promise<string> {
  if (alert.category === 'oracle') {
    return readFile(`./conf/alerts/oracle/${alert.name}.sql`)
  } else if (alert.category === 'os') {
    return readFile(`./conf/alerts/os/${alert.name}.sh`)
  }
}

export function readOracleAlertCode(name: string): Promise<string> {
  return readFile(`./conf/alerts/oracle/${name}.sql`)
}

export function readOracleMonitorCode(name: string): Promise<string> {
  return readFile(`./conf/monitors/oracle/${name}.sql`)
}

export interface Report {
  name: string
  category: string
  alert?: { name?: string, include?: string[][], exclude?: string[][] }
  title?: string[]
}

export interface Alert {
  name: string
  category: string
  cron?: string
}

export interface Node {
  ip: string
  port: number
  title: string
  status: boolean
  username?: string
  password?: string
  databases: Database[]
}

export interface Database {
  ip?: string
  title?: string
  port: number
  status: boolean
  user?: string
  password?: string
  service: string
}

enum ReportCategory {
  OS,
  ORACLE
}

export async function getDatabaseConf(): Promise<Database[]> {
  const genDatabaseConf = function (node, db): Database {
    return {ip: node.ip, port: db.port, service: db.service, status: db.status, user: db.user, password: db.password}
  }
  return flatten((await getNodeConf()).map(node => node.databases.map(db=>genDatabaseConf(node, db))))
}

export async function getDatabase(ip: string, service: string): Promise<Database> {
  const dc = await getDatabaseConf()
  return dc.filter(d=>d.ip === ip && d.service === service)[0]
}

export async function getNodeByIp(ip: string): Promise<Node> {
  return (await getNodeConf()).filter(d=>d.ip === ip)[0]
}