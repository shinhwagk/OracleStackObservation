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
    timestamp: number
    status: CheckStatus
    retry: number
}

let PingDB: Map<string, CommandCheckInfo> = new Map<string, CommandCheckInfo>()

let ncDB: Map<string, CommandCheckInfo> = new Map<string, CommandCheckInfo>()

function nodesff() {
    let nodeInfo: Map<string, { ping: CommandCheckInfo, db: CommandCheckInfo }> = new Map<string, { ping: CommandCheckInfo, db: CommandCheckInfo }>()
    for (let p in PingDB) {
        let ping = PingDB.get(p)
        let nc = ncDB.get(p)
        nodeInfo.set(p, { ping: ping, db: nc })
    }
    return Array.from(nodeInfo)
}

let CheckQueue: [string, number][] = []

export { CheckQueue, ncDB, PingDB, CommandCheckInfo, CheckStatus, nodesff }