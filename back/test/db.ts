import * as db from '../src/db'

db.fff({
  ip: "122.225.54.25",
  port: 1521,
  service: 'test',
  user: 'system',
  password: 'wingewq'
}, "select * from ").then(console.info)