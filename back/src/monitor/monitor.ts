import * as md_conf from '../conf'
import * as md_montior from './test-env-backup'
import * as md_tools from '../common/tools'
import * as md_store from '../store'

function bbb() {
  md_conf.getNodeConf().then(ips => ips.forEach(ip => md_tools.pingCheck(ip).then(bool => {
    md_store.nodePing.set(ip, bool)
  })))
}

async function start() {
  // setInterval(() => console.info("1"), 500)
  // setInterval(() => bbb(), 1000)
  setInterval(() => bbb(), 1000)
  console.info("start")
}

export {start}