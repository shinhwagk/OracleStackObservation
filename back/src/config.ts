import * as fs from 'fs';

export let databasesFile = fs.readFileSync('./config/databases.json',"utf-8")
