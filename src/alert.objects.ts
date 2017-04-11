export interface Ip {
  ip: string;
}

export interface Name {
  name: string;
  alias: string;
  tag: string[];
}

export interface AlertDatabaseName {
  dname: string
}

export interface Node extends Ip {
  hostname: string;
  port: number
  tag: string[];
}

export interface Database extends Name { }

export interface ConfNode extends Node {
  user: string;
  databases: ConfDatabase[];
  status: boolean;
}

export interface ConfDatabase extends Database {
  port?: number;
  status: boolean;
  user: string;
  password: string;
  service?: string;
  jdbcUrl?: string;
}

export interface UserNode extends Node {
  databases?: UserDatabase[];
}

export interface UserDatabase extends Database { }

export interface ConfAlert extends Name {
  cron: string;
  category: string;
}

export interface Args<T> { args?: T }

export interface ArgsOS extends Args<[string, any[]]> { }

export interface ArgsOracle extends Args<[string, string, any[]]> { }

export interface filterNodes<T> {
  include?: T[];
  exclude?: T[];
}

export interface filterNodesForOracle extends filterNodes<[string, string[]]> { }

export interface filterNodesForOS extends filterNodes<string[]> { }

export interface ConfAlertOS extends ArgsOS, filterNodesForOS, ConfAlert { }

export interface ConfAlertOracle extends ArgsOracle, filterNodesForOracle, ConfAlert { }

export enum Category { ORACLE, OS }

export interface UserAlert extends ConfAlert, Ip { }

export interface UserAlertOS extends UserAlert { }

export interface UserAlertOracle extends UserAlert, AlertDatabaseName { }