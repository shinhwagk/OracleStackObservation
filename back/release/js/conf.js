var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
import * as fs from 'fs';
import { flatten } from './common';
// function genDatabaseConf(node, db): DatabaseConf { return { ip: node.ip, port: db.port, service: db.service, user: db.user, password: db.password } }
function getNodesConf() {
    return new Promise((resolve, reject) => {
        fs.readFile('./conf/nodes.json', 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
function getNodeIpsConf() {
    return __awaiter(this, void 0, void 0, function* () {
        let nodeConfStr = yield getNodesConf();
        return JSON.parse(nodeConfStr).map(node => node.ip);
    });
}
function getNodeConf() {
    return __awaiter(this, void 0, void 0, function* () {
        let nodeConfStr = yield getNodesConf();
        return JSON.parse(nodeConfStr);
    });
}
// async function getDatabaseConf(): Promise<DatabaseConf[]> {
//   let nodeConf = await getNodesConf()
//   return flatten(JSON.parse(nodeConf).map(node => node.databases.map(db => genDatabaseConf(node, db))))
// }
function fff(conf) {
    return { ip: conf.ip, status: conf.status, port: conf.port, title: conf.title, databases: conf.databases.map(aaa) };
}
function aaa(dbs) {
    return { title: dbs.title, port: dbs.port, status: dbs.status, service: dbs.service, password: dbs.password, user: dbs.user };
}
export function genPingCheckConf() {
    return __awaiter(this, void 0, void 0, function* () {
        let nodeConf = yield getNodeConf();
        return nodeConf.map(node => node.ip);
    });
}
export function genNcCheckConf() {
    return __awaiter(this, void 0, void 0, function* () {
        let nodeConf = yield getNodeConf();
        return flatten(nodeConf.map(node => node.databases.map(db => db["ip"] = node.ip)));
    });
}
export function getNodeStructureConf() {
    return __awaiter(this, void 0, void 0, function* () {
        let nodeConf = yield getNodesConf();
        return JSON.parse(nodeConf).map(fff);
    });
}
export { getNodeConf, getNodeIpsConf };
// function getMonitorFramework(): MonitorFramework[] {
//   return [{ ip: "111", title: "string" }]
// }
// interface MonitorFramework {
//   ip: string
//   title: string
// }
//test
// getDatabaseConf().then(console.info) 
