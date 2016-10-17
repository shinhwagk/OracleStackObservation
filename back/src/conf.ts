import * as fs from 'fs';

import { flatten } from './common'
import { CheckStatus } from './store'

// function genDatabaseConf(node, db): DatabaseConf { return { ip: node.ip, port: db.port, service: db.service, user: db.user, password: db.password } }

function getNodesConf(): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile('./conf/nodes.json', 'utf-8', (err: NodeJS.ErrnoException, data: Buffer) => {
      if (err) { reject(err); } else { resolve(data); }
    })
  })
}

interface NodeConf {
  ip: string
  port: number
  title: string
  status: boolean
  databases: DatabaseConf[]
}

interface DatabaseConf {
  title: string
  port: number
  status: boolean
  user: string
  password: string
  service: string
}

async function getNodeIpsConf(): Promise<string[]> {
  let nodeConfStr: string = await getNodesConf()
  return JSON.parse(nodeConfStr).map(node => node.ip)
}

async function getNodeConf(): Promise<NodeConf[]> {
  let nodeConfStr: string = await getNodesConf()
  return JSON.parse(nodeConfStr)
}

// async function getDatabaseConf(): Promise<DatabaseConf[]> {
//   let nodeConf = await getNodesConf()
//   return flatten(JSON.parse(nodeConf).map(node => node.databases.map(db => genDatabaseConf(node, db))))
// }

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
  let nodeConf = await getNodesConf()
  return JSON.parse(nodeConf).map(fff)
}

export { getNodeConf,  getNodeIpsConf,NodeConf,DatabaseConf }



// function getMonitorFramework(): MonitorFramework[] {
//   return [{ ip: "111", title: "string" }]
// }

// interface MonitorFramework {
//   ip: string
//   title: string
// }

//test
// getDatabaseConf().then(console.info)