import {getNodeConf, getDatabaseConf, Database, Node} from "./conf";
import {CheckInfo, NodeCheckDB, PortCheckDB, AlertOracleDB} from "./store";
import {CheckType, makeKey} from "./report";

export async function apiNodes(ctx) {
  const ncs: Node[] = await getNodeConf()
  const dcs: Database[] = await getDatabaseConf()
  let temp = []
  const currTIme = new Date().getTime()
  ncs.forEach((nc: Node) => {
    const pingKey = makeKey(CheckType.PING, {args: [nc.ip]})
    let pci: CheckInfo = NodeCheckDB.get(pingKey)
    // console.info(pci, "pci")
    let dc = dcs.filter((dc: Database) => dc.ip === nc.ip).map((dc: Database) => {
      const ncKey = makeKey(CheckType.PORT, {args: [dc.ip, dc.port]})
      let nci: CheckInfo = PortCheckDB.get(ncKey)
      // console.info(PortCheckDB, ncKey, "nci")
      return {
        service: dc.service,
        timestamp: (currTIme - nci.timestamp),
        status: nci.status,
        port: dc.port,
        alert: AlertOracleDB.filter(aodb=>aodb[0] === nc.ip && aodb[1] === dc.service)
      }
    })
    temp.push({
      ip: nc.ip,
      title: nc.title,
      timestamp: (currTIme - pci.timestamp), status: pci.status, alert: [], port: nc.port,
      databases: dc
    })
  })
  ctx.type = 'application/json';
  ctx.body = JSON.stringify(temp)
}