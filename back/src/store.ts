interface NodeInfo {
    nodeCheck: boolean
    dbCheck: boolean
    timestamp: number
}

enum CheckStatus {
    DIE,
    STOP,
    NORMAL,
    DOUBT
}

interface CommandCheckInfo {
    timestamp?: number
    status?: CheckStatus
    retry: number
}

let PingDB: Map<string, CommandCheckInfo> = new Map<string, CommandCheckInfo>()

export let PingCheckQueue: string[] = []

export let NcCheckQueue: [string, [string, number]][] = []

export function genNCKey(ip: string, service: string): string { return `${ip}_${service}` }

let NcDB: Map<string, CommandCheckInfo> = new Map<string, CommandCheckInfo>()

let NodeDB: Map<string, number> = new Map<string, number>()

let test: Map<string, { ip: string, title: string, ping: {}, nc: {} }> = new Map<string, { ip: string, title: string, ping: {}, nc: {} }>()

function nodesff() {
    for (let p of NodeDB.keys()) {
        let px = PingDB.get(p)
        let ncx = NcDB.get(p)
        let ping = { timestamp: px.timestamp, status: px.status }
        let nc = { timestamp: ncx.timestamp, status: ncx.status }
        let node = { ip: p, title: "dev", ping: ping, nc: nc }
        test.set(p, node)
    }
    return Array.from(test.values())
}

let CheckQueue: [string, number][] = []

export { CheckQueue, NcDB, PingDB, CommandCheckInfo, CheckStatus, nodesff, NodeDB }