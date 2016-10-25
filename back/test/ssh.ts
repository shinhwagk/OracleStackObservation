import {Client} from "ssh2";
import {OSConnectionInfo} from "../src/tools";
export function OSConnect(server, callback) {
  var conn = new Client();
  conn.on("ready", function () {
    callback(conn);
  }).on('error', function (err) {
    console.log("connect error!");
  }).on('end', function () {
    console.log("connect end!");
  }).on('close', function (had_error) {
    console.log("connect close");
  }).connect(server);
}

const server: OSConnectionInfo = {
  host: "10.65.193.27",
  port: 22,
  password: "oracle",
  username: "root"
}

function test(command) {
  return new Promise((resolve, reject)=> {
    OSConnect(server, (conn)=> {
      conn.exec(command, (err, stream,err)=> {
        stream.on('data', (data)=> {
          console.info("haha1 " + data.toString())
          resolve(data.toString())
        }).on('close',(err)=>{
          console.info("close 1")
          conn.exec("echo c",(err,stream2)=>{
            stream2.on('data',(data2)=>{
              console.info("haha2 " + data2.toString())
              conn.end()
            })
          })
        }).stderr.on('data', (data) => reject(data.toString()));
      })
    })
  })
}

// async function ttt() {
//   const a = await test("echo a")
//   console.info(a)
//   const b = await test("echo b")
//   console.info(b)
//   return a + b
// }
console.info("111")
test("echo a").then(console.info)
// ttt().then(console.info)