import * as md_conf from '../conf'
import * as md_montior from './test-env-backup'
import * as md_tools from '../common/tools'
import * as md_store from '../store'

function genPingQueue() {
  setInterval(() => md_conf.getNodeConf().then((ips: string[]) => ips.forEach(ip => md_store.ipQueue.push(ip))), 1000)
}

function pingCheck() {
  setInterval(() => {
    if (md_store.ipQueue.length >= 1) {
      let ip = md_store.ipQueue.shift()
      let timestamp = new Date().getTime()
      md_tools.pingCheck(ip).then(bool => {
        if (bool) {
          md_store.nodePing.set(ip, [bool, timestamp, 0])
        }
        else {
          let retry = md_store.nodePing.get(ip)[2]
          md_store.nodePing.set(ip, [bool, timestamp, retry + 1])
        }
      })
    }
  }, 1000)
}

async function start() {
  genPingQueue()
  pingCheck()
}

export { start }