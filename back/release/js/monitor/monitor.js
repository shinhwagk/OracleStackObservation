var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
import * as md_conf from '../conf';
import * as md_tools from '../common/tools';
import * as md_store from '../store';
import { PingDB, NcDB, PingCheckQueue, NcCheckQueue, genNCKey, CheckStatus } from '../store';
function check(ip, port) {
    return __awaiter(this, void 0, void 0, function* () {
        let pingBool = yield pingCheck(ip);
        let ncBool = yield ncCheck(ip, port);
        PingDB.set(ip, md_tools.commandCheck(pingBool, PingDB.get(ip)));
        NcDB.set(ip, md_tools.commandCheck(ncBool, NcDB.get(ip)));
        return;
    });
}
function genCheckQueue() {
    md_conf.getNodeConf().then((nodeConfs) => {
        nodeConfs.forEach((nodeConf) => {
            let ip = nodeConf.ip;
            if (nodeConf.status) {
                PingCheckQueue.push(ip);
                PingDB.set(ip, { status: CheckStatus.DOUBT, retry: 0, timestamp: new Date().getTime() });
                nodeConf.databases.forEach((dbs) => {
                    let port = dbs.port;
                    if (dbs.status) {
                        NcCheckQueue.push([genNCKey(ip, dbs.service), [ip, dbs.service, port]]);
                        NcDB.set(genNCKey(ip, dbs.service), { status: CheckStatus.DOUBT, retry: 0, timestamp: new Date().getTime() });
                    }
                    else {
                        NcDB.set(genNCKey(ip, dbs.service), { status: md_store.CheckStatus.STOP, retry: 0, timestamp: new Date().getTime() });
                    }
                });
            }
            else {
                PingDB.set(ip, { status: md_store.CheckStatus.STOP, retry: 0, timestamp: new Date().getTime() });
            }
        });
    });
}
function pingCheck(ip) {
    const command = `ping -c 2 -t 2 ${ip}`;
    return md_tools.executeNoLoginShellCommand(command);
}
function ncCheck(ip, port) {
    const command = `nc -v -w 4 ${ip} -z ${port}`;
    return md_tools.executeNoLoginShellCommand(command);
}
function executeCheck() {
    setInterval(() => {
        while (PingCheckQueue.length >= 1) {
            let ip = PingCheckQueue.shift();
            pingCheck(ip).then(bool => {
                let retry = PingDB.get(ip).retry + 1;
                PingDB.set(ip, md_tools.commandCheck(bool, { retry: retry }));
            });
        }
        while (NcCheckQueue.length >= 1) {
            let [key, [ip, service, port]] = NcCheckQueue.shift();
            ncCheck(ip, port).then(bool => {
                let retry = NcDB.get(key).retry + 1;
                NcDB.set(genNCKey(ip, service), md_tools.commandCheck(bool, { retry: retry }));
            });
        }
    }, 1000);
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        setInterval(() => genCheckQueue(), 1000);
        executeCheck();
    });
}
export { start };
