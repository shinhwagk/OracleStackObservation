import * as oracledb from 'oracledb';

export async function text(x) {
  let conn: oracledb.IConnection = await oracledb.getConnection(
    {
      user: "system",
      password: "wingewq",
      connectString: "122.225.54.25:1521/test"
    })

  let result: oracledb.IExecuteReturn = await conn.execute("select * from dual")

  x.body = result.rows
}


