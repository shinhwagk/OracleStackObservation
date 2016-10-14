import * as fs from 'fs';

import { DatabaseConf } from './database';
import { flatten } from './common'

function genDatabaseConf(node, db): DatabaseConf { return { ip: node.ip, port: db.port, service: db.service, user: db.user, password: db.password } }

function getNodesConf(): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile('./conf/nodes.json', 'utf-8', (err: NodeJS.ErrnoException, data: Buffer) => {
      if (err) { reject(err); } else { resolve(data); }
    })
  })
}

async function getNodeConf(): Promise<string[]> {
  let nodeConfStr: string = await getNodesConf()
  return JSON.parse(nodeConfStr).map(node => node.ip)
}

async function getDatabaseConf(): Promise<DatabaseConf[]> {
  let nodeConf = await getNodesConf()
  return flatten(JSON.parse(nodeConf).map(node => node.databases.map(db => genDatabaseConf(node, db))))
}

export { getNodeConf, getDatabaseConf }

//test
// getDatabaseConf().then(console.info)