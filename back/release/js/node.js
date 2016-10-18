class Node {
    constructor(ip, status = null, timestamp = 0, retry = 0) {
        this.ip = ip;
        this.status = status;
        this.timestamp = timestamp;
        this.retry = retry;
    }
    setStatus(new_status) {
        return new Node(this.ip, new_status, this.timestamp, this.retry);
    }
    updateTimestamp() { return new Node(this.ip, this.status, 1000, this.retry); }
}
// incRetry: Node = {Node(ip, port, status, hostname, timestamp, retry + 1)
// zeroRetry: Node = Node(ip, port, status, hostname, timestamp, 0)
// calculateLatency: Node = Node(ip, port, status, hostname, System.currentTimeMillis() - timestamp, retry)
var NodeStatus;
(function (NodeStatus) {
    NodeStatus[NodeStatus["DIE"] = 0] = "DIE";
    NodeStatus[NodeStatus["STOP"] = 1] = "STOP";
    NodeStatus[NodeStatus["NORMAL"] = 2] = "NORMAL";
    NodeStatus[NodeStatus["DOUBT"] = 3] = "DOUBT";
})(NodeStatus || (NodeStatus = {}));
export { Node, NodeStatus };
