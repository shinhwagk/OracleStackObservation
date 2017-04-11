import { getNodeConfFile, getAlertConfFile } from './conf';
import { flatten } from './common';
// import { UserAlert, ConfAlert, ConfNode } from './alert.objects';
import {
  ConfNode, ConfDatabase, UserNode, UserDatabase, ConfAlertOracle, ConfAlertOS,
  AlertCategory,
  filterNodes,
  filterNodesForOracle,
  UserAlertOracle,
  UserAlertOS,
  ConfAlert
} from './objects';

async function getTrueOfStatusNodes(): Promise<ConfNode[]> {
  const nodes = (await getNodeConfFile()).filter(node => node.status);
  for (let node of nodes) {
    node.databases = node.databases.filter(database => database.status);
  }
  return nodes;
}

export async function api_nodes() {
  const nodes: ConfNode[] = await getTrueOfStatusNodes();
  return nodes
    .map(node => {
      const userNode: UserNode = {
        ip: node.ip,
        hostname: node.hostname,
        tag: node.tag,
        port: node.port,
        databases: node.databases.map(database => {
          const userDatabase: UserDatabase = {
            name: database.name,
            tag: database.tag
          }
          return userDatabase
        })
      }
      return userNode
    })
}

export async function api_alerts() {
  const alerts: Array<ConfAlert> = await getAlertConfFile();
  const nodes: ConfNode[] = await getTrueOfStatusNodes();
  return generateAlertEntries(alerts, nodes)

}

function filterIncludeForOS(nodes: ConfNode[], include: string[]): ConfNode[] {
  return nodes.filter(n => include.indexOf(n.ip) >= 0)
}

function filterExcludeForOS(nodes: ConfNode[], exclude: string[]): ConfNode[] {
  return nodes.filter(n => exclude.indexOf(n.ip) === -1)
}

function filterIncludeForOracle(nodes: ConfNode[], include: [string, string[]][]): ConfNode[] {
  const ips: string[] = include.map(([ip, names]) => ip)
  const new_nodes = nodes.filter(n => ips.indexOf(n.ip) >= 0)

  for (const node of new_nodes) {
    const ds = node.databases;
    const names: string[] = include.filter(([ip, names]) => node.ip === ip)[0][1]
    node.databases = ds.filter(d => names.indexOf(d.name) >= 0)
  }

  return new_nodes.filter(node => node.databases.length >= 1);
}

function filterExcludeForOracle(nodes: ConfNode[], exclude: string[][]): ConfNode[] {
  for (const node of nodes) {
    for (const [ip, names] of exclude) {
      if (node.ip === ip) {
        node.databases = node.databases.filter(d => names.indexOf(d.name) === -1)
      }
    }
  }
  return nodes.filter(node => node.databases.length >= 1);
}

function makeAlertEntryForOracle(ns: ConfNode[], alert: ConfAlert, userAlerts: UserAlertOracle[]) {
  ns.forEach(n => n.databases.map(d => {
    userAlerts.push({
      ip: n.ip,
      name: alert.name,
      category: alert.category,
      cron: alert.cron,
      dname: d.name
    })
  }))
}

function makeAlertEntryForOS(ns: ConfNode[], alert: ConfAlert, userAlerts: UserAlertOS[]) {
  ns.forEach(n => {
    userAlerts.push({
      ip: n.ip,
      name: alert.name,
      category: alert.category,
      cron: alert.cron
    })
  });
}

function generateAlertsForItem(alert: ConfAlert, nodes: ConfNode[], f_include, f_exclude, f_make, userAlerts) {
  const i = (<filterNodes>alert).include
  const e = (<filterNodes>alert).exclude

  let new_nodes = []

  if (i.length >= 1) {
    new_nodes = f_include(nodes, i)
  } else if (e.length >= 1) {
    new_nodes = f_exclude(nodes, e)
  } else {
    new_nodes = nodes
  }

  f_make(new_nodes, alert, userAlerts)
}

function generateAlertEntries(alerts: ConfAlert[], nodes: ConfNode[]) {
  const userAlerts: Array<UserAlertOracle | UserAlertOS> = []
  for (const alert of alerts) {
    switch (AlertCategory[alert.category]) {
      case AlertCategory.ORACLE:
        generateAlertsForItem(alert, nodes, filterIncludeForOracle, filterExcludeForOracle, makeAlertEntryForOracle, userAlerts)
        break
      case AlertCategory.OS:
        generateAlertsForItem(alert, nodes, filterIncludeForOS, filterExcludeForOS, makeAlertEntryForOS, userAlerts)
        break
    }
  }
  return userAlerts;
}