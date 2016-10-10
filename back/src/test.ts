import * as config from './config';

console.info(config.databasesFile);

interface abc {
  (ctx: string, next: () => number): any;
}

let c = (x: string, b: () => number) => {
  console.info(x)
}

function ccc(a: abc, x: string, b: () => number) {
  a(x, b)
}

ccc(c, "x", () => 1)
