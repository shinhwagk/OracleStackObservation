import * as oracledb from 'oracledb';

oracledb.getConnection(
  {
    user: "system",
    password: "wingewq",
    connectString: "122.225.54.25:1521/test"
  })

  