import * as md_conf from '../conf'
import * as md_montior from './test-env-backup'
import * as md_tools from '../common/tools'
import { CommandCheckInfo, PingDB, CheckQueue, ncDB } from '../store'

async function check(ip: string, port: number): Promise<void> {
  let pingBool = await pingCheck(ip)
  let ncBool = await ncCheck(ip, port)
  console.info(pingBool,ncBool)
  PingDB.set(ip, md_tools.commandCheck(pingBool, PingDB.get(ip)))
  ncDB.set(ip, md_tools.commandCheck(ncBool, ncDB.get(ip)))
  return
}

function genNodeCheckQueue() {
  setInterval(() => md_conf.getNodeConf().then((ips: string[]) => ips.forEach(ip => CheckQueue.push([ip, 1521]))), 1000)
}

function pingCheck(ip: string): Promise<boolean> {
  const command = `ping -c 2 ${ip}`
  return md_tools.executeNoLoginShellCommand(command)
}

function ncCheck(ip: string, port: number) {
  const command = `nc -v -w 4 ${ip} -z ${port}`
  return md_tools.executeNoLoginShellCommand(command)
}

function nodeCheck() {
  setInterval(() => {
    while (CheckQueue.length >= 1) {
      let [ip, port] = CheckQueue.shift()
      check(ip, port).then(x => null)
    }
  }, 1000)
}

async function start() {
  genNodeCheckQueue()
  nodeCheck()
}

export { start }