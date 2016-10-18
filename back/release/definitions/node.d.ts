declare class Node {
    constructor(ip: any, status?: any, timestamp?: number, retry?: number);
    ip: string;
    status: string;
    timestamp: number;
    retry: number;
    setStatus(new_status: string): Node;
    updateTimestamp(): Node;
}
declare enum NodeStatus {
    DIE = 0,
    STOP = 1,
    NORMAL = 2,
    DOUBT = 3,
}
export { Node, NodeStatus };
