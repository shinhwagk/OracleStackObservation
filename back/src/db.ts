import * as oracledb from "oracledb";
import {IPromise, IConnection} from "oracledb";
import {getCodeByAlert} from "./conf";
import {DatabaseAlert} from "./alert";

export interface DatabaseConnectInfo {
  ip: string
  port: number
  service: string
  user: string
  password: string
}

function genConnecString(dci: DatabaseConnectInfo): string {
  return `${dci.ip}:${dci.port}/${dci.service}`
}

export function genConnection(dci: DatabaseConnectInfo): IPromise<IConnection> {
  return oracledb.getConnection({user: dci.user, password: dci.password, connectString: genConnecString(dci)})
}

export async function fff(dci: DatabaseConnectInfo, sql: string): Promise<Array<Array<any>> | Array<any>> {
  const conn: oracledb.IConnection = await genConnection(dci)
  const result: oracledb.IExecuteReturn = await conn.execute(sql)
  const colName = result.metaData.map(e => e.name)
  const rows = result.rows
  await conn.close()
  return [colName].concat(rows)
}

export async function xx(alert: DatabaseAlert): Promise<boolean> {
  const sql: string = await getCodeByAlert({name: alert.name, category: "oracle"})
  const rows = await fff(alert.databaseConnectInfo, sql)
  return rows[1][0] >= 1 ? true : false
}