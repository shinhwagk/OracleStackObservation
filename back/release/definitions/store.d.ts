declare enum CheckStatus {
    DIE = 0,
    STOP = 1,
    NORMAL = 2,
    DOUBT = 3,
}
interface CommandCheckInfo {
    timestamp?: number;
    status?: CheckStatus;
    retry: number;
}
declare let PingDB: Map<string, CommandCheckInfo>;
export declare let PingCheckQueue: string[];
export declare let NcCheckQueue: [string, [string, string, number]][];
export declare function genNCKey(ip: string, service: string): string;
declare let NcDB: Map<string, CommandCheckInfo>;
declare let NodeDB: Map<string, number>;
declare function nodesff(): {
    ip: string;
    title: string;
    ping: {};
    nc: {};
}[];
declare let CheckQueue: [string, number][];
export { CheckQueue, NcDB, PingDB, CommandCheckInfo, CheckStatus, nodesff, NodeDB };
