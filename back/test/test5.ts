let cx: number = 1

let ar = [1, 2, 3]
let er = []
for (let i = ar.length; i >= 1; i -= 1, er.push(ar.pop()));
console.info(ar, er)
