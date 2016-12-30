import { readFile } from "./tools";

export function readEmailConf(): Promise<string[]> {
  return readFile('./conf/email.json').then(JSON.parse)
}

export function readPhoneConf(): Promise<string[]> {
  return readFile('./conf/phone.json').then(JSON.parse)
}