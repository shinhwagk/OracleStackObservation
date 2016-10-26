import {Database} from "./database.class";

export interface Node {
  ip:string;
  hostname:string;
  title:string;
  port:number
  status:boolean
  databases:Database[]
}

