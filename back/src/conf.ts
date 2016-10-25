import {flatten} from './common'
import {readFile} from './tools'
import {CheckStatus} from './store'

function readNodeConf(): Promise<string> {
  return readFile('./conf/nodes.json')
}

function readMonitorConf(): Promise<string> {
  return readFile('./conf/monitors.json')
}

export function readMonitorCode(monitor: Monitor): Promise<string> {
  if (monitor.category === 'oracle') {
    return readFile(`./conf/monitors/oracle/${monitor.name}.sql`)
  } else if (monitor.category === 'shell') {
    return readFile(`./conf/monitors/os/${monitor.name}.sh`)
  }
}

export function readAlertCode(monitor: Monitor): Promise<string> {
  if (monitor.category === 'oracle') {
    return readFile(`./conf/alerts/oracle/${monitor.name}.sql`)
  } else if (monitor.category === 'shell') {
    return readFile(`./conf/alerts/os/${monitor.name}.sh`)
  }
}

export function readOracleAlertCode(name: string): Promise<string> {
  return readFile(`./conf/alerts/oracle/${name}.sql`)
}

export function readOracleMonitorCode(name: string): Promise<string> {
  return readFile(`./conf/monitors/oracle/${name}.sql`)
}

export interface Monitor {
  name: string
  category: string
  alert?: { name?: string, include?: string[][], exclude?: string[][] }
  title?: string[]
}

export async function getMonitorConf(): Promise<Monitor[]> {
  const gmc = await readMonitorConf()
  return JSON.parse(gmc)
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

export async function getNodeConf(): Promise<Node[]> {
  let nodeConfStr: string = await readNodeConf()
  return JSON.parse(nodeConfStr)
}

export async function getDatabaseConf(): Promise<Database[]> {
  const nodeConfs: Node[] = await getNodeConf()
  const genDatabaseConf = function (node, db) {
    if (node.status) {
      return {ip: node.ip, port: db.port, service: db.service, status: db.status, user: db.user, password: db.password}
    } else {
      return {ip: node.ip, port: db.port, service: db.service, status: false, user: db.user, password: db.password}
    }
  }
  return flatten(nodeConfs.map(node => node.databases.map(db => genDatabaseConf(node, db))))
}

export async function getDatabase(ip: string, service: string): Promise<Database> {
  const dc = await getDatabaseConf()
  return dc.filter(d=>d.ip === ip && d.service === service)[0]
}

export async function getNodeByIp(ip: string): Promise<Node> {
  return (await getNodeConf()).filter(d=>d.ip === ip)[0]
}