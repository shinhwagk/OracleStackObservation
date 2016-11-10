import { Node, getNodeConf, getDatabaseConf, Database } from './conf'
import { makeKey, CheckType } from "./report";

export enum CheckStatus {
  DIE,
  STOP,
  NORMAL,
  DOUBT
}

export interface CheckInfo {
  timestamp?: number
  status?: CheckStatus
  retry?: number
}

export let NodeCheckDB: Map<string, CheckInfo> = new Map<string, CheckInfo>()

export let PortCheckDB: Map<string, CheckInfo> = new Map<string, CheckInfo>()

export let AlertOracleDB = []

export function replaceData(ar: any[], br: any[]) {
  for (let i = ar.length; i >= 1; i -= 1, ar.pop());
  br.forEach(c => AlertOracleDB.push(c))
}

export const MonitorDB: Map<string, Map<string, Map<string, any>>> = new Map<string, Map<string, Map<string, any>>>()

export async function getAllNodeBaseInfo(ctx) {
  const ncs: Node[] = await getNodeConf()
  const dcs: Database[] = await getDatabaseConf()
  const rep = ncs.map((nc: Node) => {
    return {
      ip: nc.ip,
      title: nc.title,
      port: nc.port,
      status: nc.status,
      databases: dcs.filter((dc: Database) => dc.ip === nc.ip).map((dc: Database) => {
        return { service: dc.service, port: dc.port, status: dc.status }
      })
    }
  })
  ctx.type = 'application/json';
  ctx.body = JSON.stringify(rep)
}