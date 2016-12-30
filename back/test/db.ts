import * as db from '../src/db'
import * as fs from '../src/tools'

async function a() {
  let b: string = await fs.readFile('conf/reports/oracle/tablespace_space.sql')

  // db.sqlToArray({
  //   ip: "122.225.54.25",
  //   port: 1521,
  //   service: 'test',
  //   user: 'system',
  //   password: 'wingewq'
  // }, b).then(console.info)
}

a().then(console.info).catch(console.info)