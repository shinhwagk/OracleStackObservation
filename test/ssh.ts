import {Client} from "ssh2";
import {OSConnectionInfo} from "../src/tools";
// import {OSConnectionInfo} from "../src/tools";
// export function OSConnect(server, callback) {
//   var conn = new Client();
//   conn.on("ready", function () {
//     callback(conn);
//   }).on('error', function (err) {
//     console.log("connect error!");
//   }).on('end', function () {
//     console.log("connect end!");
//   }).on('close', function (had_error) {
//     console.log("connect close");
//   }).connect(server);
// }
//
const server: OSConnectionInfo = {
  host: "10.65.193.27",
  port: 22,
  password: "oracle",
  username: "root"
}
//
// function test(command) {
//   return new Promise((resolve, reject)=> {
//     OSConnect(server, (conn)=> {
//       conn.exec(command, (err, stream,err)=> {
//         stream.on('data', (data)=> {
//           console.info("haha1 " + data.toString())
//           resolve(data.toString())
//         }).on('close',(err)=>{
//           console.info("close 1")
//           conn.exec("echo c",(err,stream2)=>{
//             stream2.on('data',(data2)=>{
//               console.info("haha2 " + data2.toString())
//               conn.end()
//             })
//           })
//         }).stderr.on('data', (data) => reject(data.toString()));
//       })
//     })
//   })
// }

// var Client = require('ssh2').Client;

var conn = new Client();
conn.on('ready', function() {
  console.log('Client :: ready');
  conn.exec('dfffff -hPx', function(err, stream) {
    if (err) throw err;
    stream.on('close', function(code, signal) {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', function(data) {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', function(data) {
      console.log('STDERR: ' + data);
    });
  });
}).on('error', function (err) {
  console.log("connect error!");
}).on('end', function () {
  console.log("connect end!");
}).on('close', function (had_error) {
  console.log("connect close");
}).connect({
  host: '10.65.193.22',
  port: 22,
  username: 'root',
  privateKey: require('fs').readFileSync('C:\\Users\\zhangxu\\.ssh\\id_rsa')
});