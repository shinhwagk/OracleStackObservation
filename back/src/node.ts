class Node {
  constructor(ip, status = null, timestamp = 0, retry = 0) {
    this.ip = ip
    this.status = status
    this.timestamp = timestamp
    this.retry = retry
  }

  ip: string
  status: string
  timestamp: number
  retry: number

  setStatus(new_status: string): Node {
    return new Node(this.ip, new_status, this.timestamp, this.retry)
  }


  updateTimestamp(): Node { return new Node(this.ip, this.status, 1000, this.retry) }
}
// incRetry: Node = {Node(ip, port, status, hostname, timestamp, retry + 1)

// zeroRetry: Node = Node(ip, port, status, hostname, timestamp, 0)

// calculateLatency: Node = Node(ip, port, status, hostname, System.currentTimeMillis() - timestamp, retry)

enum NodeStatus {
  DIE,
  STOP,
  NORMAL,
  DOUBT
}


export { Node, NodeStatus }

{

}