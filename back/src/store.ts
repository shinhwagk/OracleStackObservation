import { NodeConf, getNodeConf, getDatabaseConf, DatabaseConf } from './conf'

interface NodeInfo {
    nodeCheck: boolean
    dbCheck: boolean
    timestamp: number
}

enum CheckStatus {
    DIE = 1,
    STOP = 2,
    NORMAL = 3,
    DOUBT = 4
}

interface CommandCheckInfo {
    timestamp?: number
    status?: CheckStatus
    retry?: number
}

let PingDB: Map<string, CommandCheckInfo> = new Map<string, CommandCheckInfo>()

export let PingCheckQueue: string[] = []

export let NcCheckQueue: [string, number][] = []

let NcDB: Map<string, CommandCheckInfo> = new Map<string, CommandCheckInfo>()

let NodeDB: Map<string, number> = new Map<string, number>()

async function getNodeInfo(ctx) {
    const ncs: NodeConf[] = await getNodeConf()
    const dcs: DatabaseConf[] = await getDatabaseConf()
    let test = []
    const currTIme = new Date().getTime()
    ncs.forEach((nc: NodeConf) => {
        let pcci = PingDB.get(nc.ip)
        let dc = dcs.filter((dc: DatabaseConf) => dc.ip === nc.ip).map((dc: DatabaseConf) => {
            let ncci = NcDB.get(`${dc.ip}_${dc.port}`)
            return { service: dc.service, timestamp: (currTIme - ncci.timestamp), status: ncci.status, port: dc.port, alert: [] }
        })
        test.push({ ip: nc.ip, title: nc.title, ping: { timestamp: (currTIme - pcci.timestamp), status: pcci.status, alert: [], port: nc.port }, ds: dc })
    })
    ctx.type = 'application/json';
    ctx.body = JSON.stringify(test)
}

let CheckQueue: [string, number][] = []

export { CheckQueue, NcDB, PingDB, CommandCheckInfo, CheckStatus, getNodeInfo, NodeDB }

