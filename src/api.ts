import { getNodeConfFile, getAlertConfFile } from './conf';
import {
  ConfNode, ConfDatabase, UserNode, UserDatabase, ConfAlertOracle, ConfAlertOS, AlertCategory, ConfAlert,
  filterNodes,
  filterNodesForOracle
} from './objects';

function getTrueOfStatusNodes(): ConfNode[] {
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
  const userAlerts: { ip: string, cron: string, category: AlertCategory, name: string, dName?: string }[] = []
  const nodes: ConfNode[] = getTrueOfStatusNodes();

  const c = (alert, fi, fe) => {
    return generateAlertsForUser(nodes, alert, fi, fe)
  }

  for (const alert of alerts) {
    switch (AlertCategory[alert.category]) {
      case AlertCategory.ORACLE:
        // const alertOracle =
        const alertNodes: any[] = await c(alert, filterOracleInclude, filterOracleExclude)
      // alertNodes.forEach(n => userAlerts.push(n))
      // if (alertOracle.include) {
      //   filterOracleInclude(nodes, alertOracle.exclude)
      //     .forEach(n => n.databases.forEach(d => userAlerts.push([n.ip, d.name, alert.name, alert.cron, alert.category])))
      // } else if (alertOracle.exclude) {
      //   filterOracleExclude(nodes, alertOracle.exclude)
      //     .forEach(n => n.databases.forEach(d => userAlerts.push([n.ip, d.name, alert.name, alert.cron, alert.category])))
      // } else {
      //   return genOSAlerts(nodes, m)
      // }
      case AlertCategory.OS:
        const alertNodes: any[] = await generateAlertsForUser(nodes, alert, filterOSInclude, filterOSExclude)
      // const alertOS = <ConfAlertOS>alert
      // if (alertOS.include) {
      //   filterOSInclude(nodes, alertOS.include)
      //     .forEach(n => n.databases
      //       .forEach(d => userAlerts.push([n.ip, alert.name, alert.cron, alert.category])))
      // } else if (alertOS.exclude) {
      //   filterOSExclude(nodes, alertOS.exclude)
      //     .forEach(n => n.databases.forEach(d => userAlerts.push([n.ip, alert.name, alert.cron, alert.category])))
      // } else {

      // }
    }
  }
}

function filterOSInclude(nodes: ConfNode[], include: string[]): ConfNode[] {
  return nodes.filter(node => include.indexOf(node.ip) >= 0)
}

function filterOSExclude(nodes: ConfNode[], exclude: string[]): ConfNode[] {
  return nodes.filter((n: ConfNode) => exclude.indexOf(n.ip) === -1)
}

function filterOracleInclude(nodes: ConfNode[], include: [string, string[]]): ConfNode[] {
  for (const [ip, names] of include) {
    let ds = nodes.filter(node => node.ip == ip)[0].databases
    nodes.filter(node => node.ip == ip)[0].databases = ds.filter(d => names.indexOf(name) >= 0)
    //   const new_ds = []
    //   for (const d of ds) {
    //     if (names.indexOf(d.name) >= 0) { new_ds.push(d) }
    //   }
    //   nodes.filter(node => node.ip == ip)[0].databases = new_ds;
    // }
    // return nodes.filter(node => node.databases.length >= 1);
  }
  return nodes.filter(node => node.databases.length >= 1);
}

function filterOracleExclude(nodes: ConfNode[], exclude: string[][]): ConfNode[] {
  for (const node of nodes) {
    for (const [ip, names] of exclude) {
      if (node.ip === ip) {
        node.databases = node.databases.filter(d => names.indexOf(d.name) === -1)
      }
    }
  }
  return nodes.filter(node => node.databases.length >= 1);
}

// function filterOracleOfCategory(nodes: ConfNode[], alert: ConfAlert) {
//   const i = (<filterNodes>alert).include
//   const e = (<filterNodes>alert).exclude
//   if (i.length >= 1) {
//     return nodes.filter((n: ConfNode) => i.filter(([ip, name]) => n.ip === ip && n.databases.filter(d => d.name === name).length >= 1))
//   } else if (e.length >= 1) {
//     return nodes.filter((n: ConfNode) => i.filter(([ip, name]) => n.ip === ip && n.databases.filter(d => d.name === name).length >= 1))
//   } else {
//     return nodes
//   }
// }

function genNodesByAlert(nodes: ConfNode[], alert: ConfAlert, f_i, f_e) {
  const i = (<filterNodes>alert).include
  const e = (<filterNodes>alert).exclude
  if (i.length >= 1) {
    return f_i(nodes, i)
  } else if (e.length >= 1) {
    return f_e(nodes, e)
  } else {
    return nodes
  }
}

// function filterNodeByNodeFilter(nodes: ConfNode[], alert: ConfAlert, f) {
//   f(nodes, alert)

// }

function generateAlertsForUser(nodes: ConfNode[], alert: ConfAlert, f_i, f_e) {
  const nodesByFilter = f(nodes, alert)
}

function abc(nodes: ConfNode[], alert: ConfAlert) {
  genNodesByAlert(nodes, alert, filterOracleInclude, filterOracleExclude)
}

// function filterNodeByExclude(nodes: ConfNode[], exclude: string[][]): ConfNode[] { }

// async function genNodesByAlert(alert, f) {
//   // const nodes: ConfNode[] = await getTrueOfStatusNodes();
//   // const alterItem = <T & U>alert;
//   // const i = alterItem.include;
//   // const e = alterItem.exclude;
//   // if (i.length >= 1) {
//   //   f()
//   //   filterNodeByInclude(nodes, i)
//   //   return []// .forEach(n => n.databases.forEach(d => userAlerts.push([n.ip, d.name, alert.name, alert.cron, alert.category])))
//   // } else {
//   //   filterNodeByExclude(nodes, e)
//   //   // .forEach(n => n.databases.forEach(d => userAlerts.push([n.ip, d.name, alert.name, alert.cron, alert.category])))
//   //   return []
//   // }

// }