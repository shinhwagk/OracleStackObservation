import * as ssh2 from 'ssh2'

var conn: ssh2.Client = new ssh2.Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec('uptime', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => console.log('STDOUT: ' + data))
      .stderr.on('data', (data) => console.log('STDERR: ' + data));
  });
}).connect({
  host: '10.65.193.29',
  port: 22,
  username: 'root',
  password: "oracle"
});

// .connect({ host: "10.65.193.29", port: 22, username: "root", password: "oracle" })