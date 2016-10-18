import * as fs from 'fs';

import { flatten } from './common'
import { CheckStatus } from './store'

// function genDatabaseConf(node, db): DatabaseConf { return { ip: node.ip, port: db.port, service: db.service, user: db.user, password: db.password } }

function getConf(): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile('./conf/nodes.json', 'utf-8', (err: NodeJS.ErrnoException, data: Buffer) => {
      if (err) { reject(err); } else { resolve(data); }
    })
  })
}

function getMonitorConf(): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile('./conf/monitors.json', 'utf-8', (err: NodeJS.ErrnoException, data: Buffer) => {
      if (err) { reject(err); } else { resolve(data); }
    })
  })
}

export function getMonitorCode(name: string, category: string) {
  if (category === 'oracle') {
    return new Promise((resolve, reject) => {
      fs.readFile(`./conf/monitors/${name}.sql`, 'utf-8', (err: NodeJS.ErrnoException, data: Buffer) => {
        if (err) { reject(err); } else { resolve([name, category, data]); }
      })
    })
  } else {
    return new Promise((resolve, reject) => {
      fs.readFile(`./conf/monitor/${name}.sh`, 'utf-8', (err: NodeJS.ErrnoException, data: Buffer) => {
        if (err) { reject(err); } else { resolve([name, category, data]); }
      })
    })
  }
}

export async function genMonitor() {
  const gmc = await getMonitorConf()
  return JSON.parse(gmc)
}

interface NodeConf {
  ip: string
  port: number
  title: string
  status: boolean
  databases: DatabaseConf[]
}

interface DatabaseConf {
  ip?: string
  title?: string
  port: number
  status: boolean
  user?: string
  password?: string
  service: string
}

async function getNodeIpsConf(): Promise<string[]> {
  let nodeConfStr: string = await getConf()
  return JSON.parse(nodeConfStr).map(node => node.ip)
}

async function getNodeConf(): Promise<NodeConf[]> {
  let nodeConfStr: string = await getConf()
  return JSON.parse(nodeConfStr)
}

export async function getDatabaseConf(): Promise<DatabaseConf[]> {
  let nodeConfs: NodeConf[] = await getNodeConf()
  const genDatabaseConf = function (node, db) {
    if (node.status) {
      return { ip: node.ip, port: db.port, service: db.service, status: db.status }
    } else {
      return { ip: node.ip, port: db.port, service: db.service, status: false }
    }
  }
  return flatten(nodeConfs.map(node => node.databases.map(db => genDatabaseConf(node, db))))
}

function fff(conf): NodeConf {
  return { ip: conf.ip, status: conf.status, port: conf.port, title: conf.title, databases: conf.databases.map(aaa) }
}

function aaa(dbs): DatabaseConf {
  return { title: dbs.title, port: dbs.port, status: dbs.status, service: dbs.service, password: dbs.password, user: dbs.user }
}

export async function genPingCheckConf() {
  let nodeConf: NodeConf[] = await getNodeConf()
  return nodeConf.map(node => node.ip)
}

export async function genNcCheckConf() {
  let nodeConf: NodeConf[] = await getNodeConf()
  return flatten(nodeConf.map(node => node.databases.map(db => db["ip"] = node.ip)))
}

export async function getNodeStructureConf(): Promise<NodeConf[]> {
  let nodeConf = await getConf()
  return JSON.parse(nodeConf).map(fff)
}

export { getNodeConf, getNodeIpsConf, NodeConf, DatabaseConf }



// function getMonitorFramework(): MonitorFramework[] {
//   return [{ ip: "111", title: "string" }]
// }

// interface MonitorFramework {
//   ip: string
//   title: string
// }

//test
// getDatabaseConf().then(console.info)