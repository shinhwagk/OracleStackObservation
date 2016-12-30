// import * as oracledb from "oracledb";
// import { IPromise, IConnection } from "oracledb";
import { getCodeByAlert, Category } from "./conf";
import { DatabaseAlert } from "./alert";
import { ConnInfo } from './report';
import * as axios from 'axios';

export interface DatabaseConnectInfo {
  ip: string;
  port: number;
  service: string;
  user: string;
  password: string;
}

// function genConnecString(dci: DatabaseConnectInfo): string {
//   return `${dci.ip}:${dci.port}/${dci.service}`
// }

// export function genConnection(dci: DatabaseConnectInfo): IPromise<IConnection> {
//   return oracledb.getConnection({ user: dci.user, password: dci.password, connectString: genConnecString(dci) })
// }

// export async function sqlToArray(dci: DatabaseConnectInfo, sql: string): Promise<Array<Array<any>> | Array<any>> {
//   const conn: oracledb.IConnection = await genConnection(dci)
//   const result: oracledb.IExecuteReturn = await conn.execute(sql)
//   const colName = result.metaData.map(e => e.name)
//   const rows = result.rows
//   await conn.close()
//   return [colName].concat(rows)
// }

// export async function sqlToCount(dci: DatabaseConnectInfo, sql: string): Promise<boolean> {
//   const conn: oracledb.IConnection = await genConnection(dci)
//   const result: oracledb.IExecuteReturn = await conn.execute(sql)
//   const colName = result.metaData.map(e => e.name)
//   const rows = result.rows
//   await conn.close();
//   return rows[0][0] >= 1 ? true : false;
// }

export async function xx(alert: DatabaseAlert): Promise<boolean> {
  const sql: string = await getCodeByAlert({ name: alert.name, category: Category.ORACLE, cron: alert.cron })
  const countSql: string = `select count(*) from (${sql})`
  // const bool = await sqlToCount(alert.databaseConnectInfo, countSql)

  const dbconf = alert.databaseConnectInfo

  // try {
  const ci: ConnInfo = { jdbcUrl: `jdbc:oracle:thin:@${dbconf.ip}:${dbconf.port}/${dbconf.service}`, username: dbconf.user, password: dbconf.password }
  const qi = { ci: ci, sqlText: countSql, parameters: [] }
  const rep = await axios.post('http://10.65.103.15:8081/query/array', qi)
  // } catch (e) {
  //   console.info(e)
  // }
  return Number(rep.data[1][0]) >= 1 ? true : false;
}