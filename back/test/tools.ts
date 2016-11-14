// import {executeNodeCheck} from "../src/report";
// executeNodeCheck().then(console.info).catch(err=>console.info(err + " xx"))

enum A {
  a, b
}

interface B {
  a: A.a
}

function abc(): B {
  return JSON.parse(`{"a":"a"}`)
}

console.info(A[A[abc().a]] === A[A.a] )