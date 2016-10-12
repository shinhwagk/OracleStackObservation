import * as md_cp from 'child_process';
import * as md_ssh2 from 'ssh2'

function pingCheck(ip: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    md_cp.exec(`ping -n 2 ${ip}`, (error, stdout, stderr) => {
      if (error) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

function portCheck(ip: string, port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    md_cp.exec(`nc -v -w 4 ${ip} -z ${port}`, (error, stdout, stderr) => {
      if (error) {
        reject(false)
      } else {
        resolve(true)
      }
    })
  })
}

function execRemoteShellCommand(node: { ip: string, port: number, username: string, password: string }, shellCommand: string): Promise<string> {
  return new Promise((resolve, reject) => {
    var conn = new md_ssh2.Client();
    conn.on('ready', () => {
      // console.log('Client :: ready');
      conn.exec(shellCommand, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          // console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          conn.end();
        }).on('data', (data) => resolve(data.toString()))
          .stderr.on('data', (data) => reject(data.toString()));
      });
    }).connect({
      host: node.ip,
      port: node.port,
      username: node.username,
      password: node.password
    });
  })
}

//test
// execRemoteShellCommand({ ip: "10.65.193.39", port: 22, username: "root", password: "oracle" }, "df -hP | grep -v Filesystem").then(console.info)
export { pingCheck, portCheck, execRemoteShellCommand }