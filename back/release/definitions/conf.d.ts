interface NodeConf {
    ip: string;
    port: number;
    title: string;
    status: boolean;
    databases: DatabaseConf[];
}
interface DatabaseConf {
    title: string;
    port: number;
    status: boolean;
    user: string;
    password: string;
    service: string;
}
declare function getNodeIpsConf(): Promise<string[]>;
declare function getNodeConf(): Promise<NodeConf[]>;
export declare function genPingCheckConf(): Promise<string[]>;
export declare function genNcCheckConf(): Promise<any>;
export declare function getNodeStructureConf(): Promise<NodeConf[]>;
export { getNodeConf, getNodeIpsConf, NodeConf, DatabaseConf };
