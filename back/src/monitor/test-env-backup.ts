import { execRemoteShellCommand } from '../common/tools'

function formatDu(str: string): string[][] {
  let arr: string[] = str.split("\n")
  arr.pop()
  return arr.map(line => line.split(/\s+/))
}

async function abc(ip?: string, port?: number) {
  let str = await execRemoteShellCommand({ ip: "10.65.193.39", port: 22, username: "root", password: "oracle" }, "df -hP | grep -v Filesystem")
  return formatDu(str)
}

//test
abc().then(console.info)