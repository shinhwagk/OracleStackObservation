import * as axios from 'axios';
import { readPhoneConf } from './conf';
import { genOrderNo } from './tools';

export async function alertOSDisk() {
  const alertName = 'disk_space';
  const ips = await axios.get("http://10.65.193.29:3000/api/nodes").then(rep => rep.data).then((nodes: any[]) => nodes.map(node => node.ip))
  ips.forEach((ip: string) => {
    axios.get(`http://10.65.193.29:3000/api/report/os/${ip}/${alertName}`)
      .then(rep => rep.data)
      .then((diskinfos: string[][]) => diskinfos.slice(1))
      .then((diskinfos: string[][]) => diskinfos.filter((diskinfo: string[]) => Number(diskinfo[4].split('%')[0]) >= 80))
      .then((diskinfos: string[][]) =>
        diskinfos.forEach((diskinfo: string[]) => {
          const content = `ip:${ip}--filesystem:${diskinfo[0]}>${diskinfo[4].split('%')[0]}`
          console.info(content)
          sendAlert(content).then(p => console.info("send success."))
        })
      )
  })
}
// init
alertOSDisk()

async function sendAlert(content: string) {
  const phones: string[] = await readPhoneConf()
  const phonecnt = phones.length
  const phonestr = phones.join(',')
  const orderNo = genOrderNo()
  const body = `appId=TOC&orderNo=dba_${orderNo}&protocol=S&targetCount=${phones.length}&targetIdenty=${phonestr}&content=${content}&isRealTime=true`
  axios.post('http://10.65.209.12:8380/mns-web/services/rest/msgNotify', body).then(p => console.info(p.status)).catch(e => console.info(e))
}