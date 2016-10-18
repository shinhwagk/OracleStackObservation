import { NodeConf, getNodeConf, getDatabaseConf, DatabaseConf, genMonitor, getMonitorCode } from '../conf'
import * as md_tools from '../common/tools'
import { CommandCheckInfo, PingDB, CheckQueue, NcDB, NodeDB, PingCheckQueue, NcCheckQueue, CheckStatus } from '../store'

function genCheckQueue() {
  //ping queue
  // getNodeConf().then((ncs: NodeConf[]) => {
  //   ncs.forEach((nc: NodeConf) => {
  //     const ip = nc.ip
  //     if (nc.status) {
  //       PingCheckQueue.push(ip)
  //       if (!PingDB.has(ip)) {
  //         PingDB.set(ip, { status: CheckStatus.DOUBT, retry: 0, timestamp: new Date().getTime() })
  //       }
  //     } else {
  //       PingDB.set(ip, { status: CheckStatus.STOP, timestamp: new Date().getTime() })
  //     }
  //   })
  // })

  //natcat queue
  getDatabaseConf().then((dcs: DatabaseConf[]) => {
    dcs.forEach((dc: DatabaseConf) => {
      const ip = dc.ip
      const port = dc.port
      const key = `${ip}_${port}`

      if (!NcDB.has(key)) {
        if (dc.status) {
          NcDB.set(key, { status: CheckStatus.DOUBT, timestamp: new Date().getTime(), retry: 0 })
        } else {
          NcDB.set(key, { status: CheckStatus.STOP, timestamp: new Date().getTime() })
        }
      }

      const commandCheckINfo: CommandCheckInfo = NcDB.get(key)
      const status: CheckStatus = commandCheckINfo.status
      const timestamp: number = commandCheckINfo.timestamp + 1000 * 5
      const currTimestamp: number = new Date().getTime()
      if (status === CheckStatus.DOUBT || status === CheckStatus.NORMAL || (status === CheckStatus.DIE && timestamp < currTimestamp)) {
        // NcCheckQueue.push([ip, port])
        ncCheck(ip, port).then(bool => {
          let cci = NcDB.get(`${ip}_${port}`)
          if (cci.status !== CheckStatus.DIE)
            NcDB.set(`${ip}_${port}`, md_tools.verifyCheckInfo(bool, cci))
        })

      }
      // if ((status === CheckStatus.DOUBT) || (status === CheckStatus.NORMAL)) {
      //   NcCheckQueue.push([ip, port])
      // }
    })
  })
}

function nodePingCheck() {
  getNodeConf().then((ncs: NodeConf[]) => {
    ncs.forEach((nc: NodeConf) => {
      const ip = nc.ip

      if (!PingDB.has(ip)) {
        if (nc.status) {
          PingDB.set(ip, { status: CheckStatus.DOUBT, timestamp: new Date().getTime(), retry: 0 })
        } else {
          PingDB.set(ip, { status: CheckStatus.STOP, timestamp: new Date().getTime() })
        }
      }

      pingCheck(ip).then(bool => {
        const cci: CommandCheckInfo = PingDB.get(ip)
        const status: CheckStatus = cci.status
        const timestamp: number = cci.timestamp + 1000 * 5
        const currTimestamp: number = new Date().getTime()
        if (status === CheckStatus.DOUBT || status === CheckStatus.NORMAL || (status === CheckStatus.DIE && timestamp < currTimestamp))
          PingDB.set(ip, md_tools.verifyCheckInfo(bool, cci))
      }).catch(console.info)
    })
  })
}

function databasePortCheck() {
  getDatabaseConf().then((dcs: DatabaseConf[]) => {
    dcs.forEach((dc: DatabaseConf) => {
      const ip = dc.ip
      const port = dc.port
      const key = `${ip}_${port}`

      if (!NcDB.has(key)) {
        if (dc.status) {
          NcDB.set(key, { status: CheckStatus.DOUBT, timestamp: new Date().getTime(), retry: 0 })
        } else {
          NcDB.set(key, { status: CheckStatus.STOP, timestamp: new Date().getTime() })
        }
      }

      ncCheck(ip, port).then(bool => {
        const cci: CommandCheckInfo = NcDB.get(key)
        const status: CheckStatus = cci.status
        const timestamp: number = cci.timestamp + 1000 * 5
        const currTimestamp: number = new Date().getTime()
        if (status === CheckStatus.DOUBT || status === CheckStatus.NORMAL || (status === CheckStatus.DIE && timestamp < currTimestamp))
          NcDB.set(`${ip}_${port}`, md_tools.verifyCheckInfo(bool, cci))
      }).catch(console.info)
    })
  })
}


function pingCheck(ip: string): Promise<boolean> {
  const command = `ping -c 2 -W 2 ${ip}`
  return md_tools.executeNoLoginShellCommand(command)
}

function ncCheck(ip: string, port: number): Promise<boolean> {
  const command = `nc -v -w 4 ${ip} -z ${port}`
  return md_tools.executeNoLoginShellCommand(command)
}

function executeCheck() {
  setInterval(() => {
    databasePortCheck()
    nodePingCheck()
    // console.info(NcDB)
    // console.info(PingDB)
  }, 1000)
}

export async function abc(ctx) {
  const gm: { name: string, category: string }[] = await genMonitor()
  const b = await Promise.all(gm.filter(g => g.category === "oracle").map(g => getMonitorCode(g.name, g.category)))
  ctx.body = b
}

export function start() { executeCheck() }