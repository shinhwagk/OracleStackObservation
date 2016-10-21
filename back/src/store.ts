import { Node, getNodeConf, getDatabaseConf, Database } from './conf'

enum CheckStatus {
    DIE = 1,
    STOP = 2,
    NORMAL = 3,
    DOUBT = 4
}

interface CheckInfo {
    timestamp?: number
    status?: CheckStatus
    retry?: number
}

let PingDB: Map<string, CheckInfo> = new Map<string, CheckInfo>()

export let PingCheckQueue: string[] = []

export let NcCheckQueue: [string, number][] = []

let NcDB: Map<string, CheckInfo> = new Map<string, CheckInfo>()

let NodeDB: Map<string, number> = new Map<string, number>()

export let AlertOracleDB = []

let AlertOSDB: Map<string, string> = new Map<string, string>()

export function replaceData(ar: any[], br: any[]) {
    // console.info(a.length)
    // for (let i = a.length; i >= 1; i -= 1, b.push(a.pop()));

    for (let i = ar.length; i >= 1; i -= 1, ar.pop());
    br.forEach(c=>AlertOracleDB.push(c))

    // while (a.length >= 1) {
    //     a.pop()
    // }
    // b.forEach(x => a.push(x))
}

export const MonitorDB: Map<string, Map<string, Map<string, any>>> = new Map<string, Map<string, Map<string, any>>>()

async function getNodeInfo(ctx) {
    const ncs: Node[] = await getNodeConf()
    const dcs: Database[] = await getDatabaseConf()
    let test = []
    const currTIme = new Date().getTime()
    ncs.forEach((nc: Node) => {
        let pcci: CheckInfo = PingDB.get(nc.ip)
        let dc = dcs.filter((dc: Database) => dc.ip === nc.ip).map((dc: Database) => {
            let ncci: CheckInfo = NcDB.get(`${dc.ip}_${dc.port}`)
            return { service: dc.service, timestamp: (currTIme - ncci.timestamp), status: ncci.status, port: dc.port, alert: [] }
        })
        test.push({ ip: nc.ip, title: nc.title, ping: { timestamp: (currTIme - pcci.timestamp), status: pcci.status, alert: [], port: nc.port }, ds: dc })
    })
    ctx.type = 'application/json';
    ctx.body = JSON.stringify(test)
}

let CheckQueue: [string, number][] = []

export { CheckQueue, NcDB, PingDB, CheckInfo, CheckStatus, getNodeInfo, NodeDB }

