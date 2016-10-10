import * as fs from 'fs';
import * as nconf from 'nconf';

nconf.overrides({
  'always': 'be this value'
});

nconf.env().argv();
// export let databasesFile = fs.readFileSync('config/databases.json',"utf-8")
let a = nconf.file('bbb', 'src/conf/afdf.json');
console.info(a.use('bbb').get("a"))