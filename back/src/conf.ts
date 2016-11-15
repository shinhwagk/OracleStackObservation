import { flatten } from "./common";
import { readFile } from "./tools";

let loadConfFun: <T>(string) => Promise<T[]> = (confPath: string) =>
  readFile(confPath).then(JSON.parse).catch(console.info);

export function getNodeConf(): Promise<NodeConf[]> {
  return loadConfFun<NodeConf>('./conf/nodes.json');
}

export function getReportConf(): Promise<Report[]> {
  return loadConfFun<Report>('./conf/reports.json');
}

export function getAlertConf(): Promise<AlertConf[]> {
  return loadConfFun<AlertConf>('./conf/alerts.json');
}

export function getCodeByReport(report: Report): Promise<string> {
  if (report.category === 'oracle') {
    return readFile(`./conf/reports/oracle/${report.name}.sql`)
  } else if (report.category === 'os') {
    return readFile(`./conf/reports/os/${report.name}.sh`)
  }
}

export function getCodeByAlert(alert: AlertConf): Promise<string> {
  if (alert.category === ReportCategory.DATABASE) {
    return readFile(`./conf/alerts/oracle/${alert.name}.sql`)
  } else if (alert.category === ReportCategory.OS) {
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

export enum ReportCategory {
  OS,
  DATABASE
}

export interface ReportConf {
  name: string;
  title?: string[];
  category: ReportCategory;
  include?: string[][] | string[];
  exclude?: string[][] | string[];
}

enum DatabaseCategory {
  ORACLE,
  MYSQL
}

export interface AlertConf {
  name: string;
  category: ReportCategory;
  cron: string;
  include?: string[][] | string[];
  exclude?: string[][] | string[];
}

export interface NodeConf {
  ip: string
  port: number
  title: string
  status: boolean
  username?: string
  password?: string
  databases: DatabaseConf[]
}

export interface DatabaseConf {
  ip?: string
  title?: string
  port: number
  status: boolean
  user?: string
  password?: string
  service: string
}

export async function getDatabaseConf(): Promise<DatabaseConf[]> {
  const genDatabaseConf = function (node, db): DatabaseConf {
    return { ip: node.ip, port: db.port, service: db.service, status: db.status, user: db.user, password: db.password }
  }
  return flatten((await getNodeConf()).map(node => node.databases.map(db => genDatabaseConf(node, db))))
}

export async function getDatabase(ip: string, service: string): Promise<DatabaseConf> {
  const dc = await getDatabaseConf()
  return dc.filter(d => d.ip === ip && d.service === service)[0]
}

export async function getNodeByIp(ip: string): Promise<NodeConf> {
  return (await getNodeConf()).filter(d => d.ip === ip)[0]
}