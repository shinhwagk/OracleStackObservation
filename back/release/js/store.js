var CheckStatus;
(function (CheckStatus) {
    CheckStatus[CheckStatus["DIE"] = 0] = "DIE";
    CheckStatus[CheckStatus["STOP"] = 1] = "STOP";
    CheckStatus[CheckStatus["NORMAL"] = 2] = "NORMAL";
    CheckStatus[CheckStatus["DOUBT"] = 3] = "DOUBT";
})(CheckStatus || (CheckStatus = {}));
let PingDB = new Map();
export let PingCheckQueue = [];
export let NcCheckQueue = [];
export function genNCKey(ip, service) { return `${ip}_${service}`; }
// let c = new Map<string, Map<string, number>>()
let NcDB = new Map();
let NodeDB = new Map();
let test = new Map();
function nodesff() {
    for (let p of NodeDB.keys()) {
        let px = PingDB.get(p);
        let ncx = NcDB.get(p);
        let ping = { timestamp: px.timestamp, status: px.status };
        let nc = { timestamp: ncx.timestamp, status: ncx.status };
        let node = { ip: p, title: "dev", ping: ping, nc: nc };
        test.set(p, node);
    }
    return Array.from(test.values());
}
let CheckQueue = [];
export { CheckQueue, NcDB, PingDB, CheckStatus, nodesff, NodeDB };
