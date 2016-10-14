import * as md_conf from '../conf'
import * as md_montior from './test-env-backup'
import * as md_tools from '../common/tools'
import * as md_store from '../store'

async function check(ip: string, port: number) {
  let pingBool = await md_tools.pingCheck(ip)
  let ncBool = await md_tools.portCheck(ip, port)
  md_store.nodeCheck.set(ip, { nodeCheck: pingBool, dbCheck: ncBool, timestamp: new Date().getTime() })
}

function genNodeCheckQueue() {
  setInterval(() => md_conf.getNodeConf().then((ips: string[]) => ips.forEach(ip => md_store.ipQueue.push([ip, 1521]))), 5000)
}

function nodeCheck() {
  setInterval(() => {
    while (md_store.ipQueue.length >= 1) {
      let [ip, port] = md_store.ipQueue.shift()
      check(ip, port).then(x => null)
    }
  }, 5000)
}

async function start() {
  genNodeCheckQueue()
  nodeCheck()
}

export { start }