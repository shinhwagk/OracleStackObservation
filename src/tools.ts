import * as md_cp from "child_process";
import * as fs from "fs";
import { logger } from "./logger";

export function readFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err: NodeJS.ErrnoException, data: Buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  })
}

export function genOrderNo(): string {
  const tail: string = Math.ceil(Math.random() * 999999).toString()
  if (tail.length < 6) {
    return genOrderNo()
  } else {
    const head = new Date().getTime()
    return head.toString() + tail
  }
}