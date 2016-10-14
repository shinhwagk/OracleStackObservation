interface NodeInfo {
    nodeCheck: boolean
    dbCheck: boolean
    timestamp: number
}
let nodeCheck: Map<string, NodeInfo> = new Map<string, NodeInfo>()
let portNC: Map<string, boolean> = new Map<string, boolean>()
let ipQueue: [string,number][] = []

export { ipQueue, portNC, nodeCheck }