import { readFile } from '../src/tools'


readFile(`./conf/alerts/oracle/tablespace_space.sql`).then(console.info).catch(console.info)