// let b: Map<string, Map<string, Map<string, string>>> = new Map<string, Map<string, Map<string, string>>>()
//
//
// b.set("a", new Map<string, Map<string, string>>())
// let cm = b.get("a")
// cm.set("b", new Map<string, string>())
// let x = cm.get("b")
// x.set("sss", "sss")
//
// let xxx = Array.from(b).map(([l, v]) => {
//   return [l, Array.from(v).map(([kk, vv]) => {
//     return [kk, Array.from(vv)]
//   })]
// })
//
//
//
// console.info(JSON.stringify(xxx))