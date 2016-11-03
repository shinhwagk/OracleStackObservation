import * as process from "process";
import * as fs from "fs";
import {logger} from "./logger";

export function flatten(array: any[]) {
  return [].concat.apply([], array)
}

export function flatmap(array: any[], f: (any) => any) {
  return [].concat.apply([], array).map(f)
}

export function genPidFile() {
  const pid = process.pid
  const pidFilePath = "RUNNING_PID"
  fs.writeFileSync(pidFilePath, pid)
  logger.info("generate pid file.")
}