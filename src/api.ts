import { getNodeConfFile, getAlertConfFile } from './conf';
import { flatten } from './common';
import { UserAlertOS, UserAlertOracle } from './objects';
import {
  ConfNode, ConfDatabase, UserNode, UserDatabase, ConfAlertOracle, ConfAlertOS, AlertCategory, ConfAlert,
  filterNodes,
  filterNodesForOracle,
  UserAlertOracle
} from './objects';

async function getTrueOfStatusNodes(): Promise<ConfNode[]> {
  const nodes = (await getNodeConfFile()).filter(node => node.status);
  for (let node of nodes) {
    node.databases = node.databases.filter(database => database.status);
  }
  return nodes;
}

// function getDatabaseB

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

// export async function api_alerts_os(): Promise<ConfAlertOS[]> {
//   return (await getAlertConfFile())
//     .filter(alert => alert.category == AlertCategory[AlertCategory.OS])
//     .map((alert: ConfAlertOS) => alert.)
// }

// export async function api_alerts_oracle(): Promise<ConfAlertOracle[]> {
//   return (await getAlertConfFile()).filter(alert => alert.category == AlertCategory[AlertCategory.ORACLE])
// }

export async function api_alerts() {
  const alerts: Array<ConfAlert> = await getAlertConfFile();
  let userAlerts: Array<UserAlertOracle | UserAlertOS> = []
  const nodes: ConfNode[] = await getTrueOfStatusNodes();

  for (const alert of alerts) {
    let cn: ConfNode[] = [];
    switch (AlertCategory[alert.category]) {
      case AlertCategory.ORACLE:
        cn = await generateAlertsForUser(nodes, alert, filterIncludeForOracle, filterExcludeForOracle);
        cn.map(n => n.databases.map(d => {
          userAlerts.push({
            ip: n.ip,
            name: alert.name,
            category: alert.category,
            cron: alert.cron,
            dname: d.name
          })
        }))
        break;
      case AlertCategory.OS:
        cn = await generateAlertsForUser(nodes, alert, filterIncludeForOS, filterExcludeForOS)
        cn.map(n => {
          userAlerts.push({
            ip: n.ip,
            name: alert.name,
            category: alert.category,
            cron: alert.cron
          })
        });
        break;
    }
  }
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

// function genNodesByAlert(nodes: ConfNode[], alert: ConfAlert, f_i, f_e) {
//   const i = (<filterNodes>alert).include
//   const e = (<filterNodes>alert).exclude
//   let alertNode = [];
//   if (i.length >= 1) {
//     alertNode = f_i(nodes, i)
//   } else if (e.length >= 1) {
//     alertNode = f_e(nodes, e)
//   } else {
//     alertNode = nodes
//   }
// }

function generateAlertsForUser(nodes: ConfNode[], alert: ConfAlert, f_include, f_exclude): ConfNode[] {
  const i = (<filterNodes>alert).include
  const e = (<filterNodes>alert).exclude
  if (i.length >= 1) {
    return f_include(nodes, i)
  } else if (e.length >= 1) {
    return f_exclude(nodes, e)
  } else {
    return nodes
  }
}