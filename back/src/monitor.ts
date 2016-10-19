import * as os from 'os'
import { Node, getNodeConf, getDatabaseConf, Database, readMonitorCode, getMonitorConf, Monitor } from './conf'
import * as md_tools from './tools'
import { CheckInfo, PingDB, CheckQueue, NcDB, NodeDB, PingCheckQueue, NcCheckQueue, CheckStatus } from './store'

function genCheckQueue() {
  getDatabaseConf().then((dcs: Database[]) => {
    dcs.forEach((dc: Database) => {
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

      const ci: CheckInfo = NcDB.get(key)
      const status: CheckStatus = ci.status
      const timestamp: number = ci.timestamp + 1000 * 5
      const currTimestamp: number = new Date().getTime()
      if (status === CheckStatus.DOUBT || status === CheckStatus.NORMAL || (status === CheckStatus.DIE && timestamp < currTimestamp)) {
        // NcCheckQueue.push([ip, port])
        ncCheck(ip, port).then(bool => {
          let cci = NcDB.get(`${ip}_${port}`)
          if (cci.status !== CheckStatus.DIE)
            NcDB.set(`${ip}_${port}`, md_tools.verifyCheckInfo(bool, cci))
        })
      }
    })
  })
}

function nodePingCheck() {
  getNodeConf().then((ncs: Node[]) => {
    ncs.forEach((nc: Node) => {
      const ip = nc.ip

      if (!PingDB.has(ip)) {
        if (nc.status) {
          PingDB.set(ip, { status: CheckStatus.DOUBT, timestamp: new Date().getTime(), retry: 0 })
        } else {
          PingDB.set(ip, { status: CheckStatus.STOP, timestamp: new Date().getTime() })
        }
      }

      executeCheckCommand({ args: [ip] }, pingCheckCommand).then(bool => {
        const ci: CheckInfo = PingDB.get(ip)
        const status: CheckStatus = ci.status
        const timestamp: number = ci.timestamp + 1000 * 5
        const currTimestamp: number = new Date().getTime()
        if (status === CheckStatus.DOUBT || status === CheckStatus.NORMAL || (status === CheckStatus.DIE && timestamp < currTimestamp))
          PingDB.set(ip, md_tools.verifyCheckInfo(bool, ci))
      }).catch(console.info)
    })
  })
}

function databasePortCheck() {
  getDatabaseConf().then((dcs: Database[]) => {
    dcs.forEach((dc: Database) => {
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

      executeCheckCommand({ args: [ip, port] }, ncCheckCommand).then(bool => {
        const ci: CheckInfo = NcDB.get(key)
        const status: CheckStatus = ci.status
        const timestamp: number = ci.timestamp + 1000 * 5
        const currTimestamp: number = new Date().getTime()
        if (status === CheckStatus.DOUBT || status === CheckStatus.NORMAL || (status === CheckStatus.DIE && timestamp < currTimestamp))
          NcDB.set(`${ip}_${port}`, md_tools.verifyCheckInfo(bool, ci))
      }).catch(console.info)
    })
  })
}

function genPingCheckFun(): (string) => Promise<boolean> {
  function genPingCommandFun() {
    const platform = os.platform()
    if (platform === 'darwin') {
      return function (ip: string) { return `ping -c 2 -t 2 ${ip}` }
    }
    else if (platform === 'linux') {
      return function (ip: string) { return `ping -c 2 -W 2 ${ip}` }
    } else {
      throw new Error("no set this platform for ping command: " + platform);
    }
  }

  let genPingCommand: (string) => string = genPingCommandFun()

  return function (ip: string) {
    const command: string = genPingCommand(ip)
    return md_tools.executeNoLoginShellCommand(command)
  }
}

function genNcCheckCommand(): (string, number) => Promise<boolean> {
  function genNcCommandFun() {
    const platform = os.platform()
    if (platform === 'win32') {
      return function (ip: string, port: number) { return `nc64.exe -v -w 4 ${ip} -z ${port}` }
    }
    else if (platform === 'linux') {
      return function (ip: string, port: number) { return `nc64.exe -v -w 4 ${ip} -z ${port}` }
    } else {
      throw new Error("no set this platform for nc command: " + platform);
    }
  }

  let genNcCommand: (string, number) => string = genNcCommandFun()

  return function (ip: string, port: number) {
    const command: string = genNcCommand(ip, port)
    return md_tools.executeNoLoginShellCommand(command)
  }
}

function platformCheckCommand(win32Fun, linuxFun) {
  const platform = os.platform()
  if (platform === 'win32') { return win32Fun }
  else if (platform === 'linux') { return linuxFun }
  else { throw new Error("no set this platform for nc command: " + platform); }
}

interface commandArguments { args: Array<number | string> }

function pingWin32Command(ca: commandArguments) { return `ping -n 2 -w 2 ${ca[0]}` }

function pingLinuxCommand(ca: commandArguments) { return `ping -n 2 -w 2 ${ca[0]}` }

function ncWin32Command(ca: commandArguments) { return `nc64.exe -v -w 4 ${ca[0]} -z ${ca[1]}` }

function ncLinuxCommand(ca: commandArguments) { return `nc64.exe -v -w 4 ${ca[0]} -z ${ca[1]}` }

const pingCheckCommand: (commandArguments) => string = platformCheckCommand(pingWin32Command, pingLinuxCommand)

const ncCheckCommand: (commandArguments) => string = platformCheckCommand(ncWin32Command, ncLinuxCommand)

export function executeCheckCommand(ca: commandArguments, f: (commandArguments) => string): Promise<boolean> {
  const command = f(ca)
  return md_tools.executeNoLoginShellCommand(command)
}

export function ncCheck(ca: commandArguments): Promise<boolean> {
  const command = ncCheckCommand(ca)
  return md_tools.executeNoLoginShellCommand(command)
}

export function pingCheck(ca: commandArguments): Promise<boolean> {
  const command = pingCheckCommand(ca)
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
  const monitors: Monitor[] = await getMonitorConf()
  const b: string[] = await Promise.all(monitors.map(readMonitorCode))
  ctx.body = b
}

export function start() { executeCheck() }