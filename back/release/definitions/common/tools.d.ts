import { CommandCheckInfo } from '../store';
export declare function executeNoLoginShellCommand(command: string): Promise<boolean>;
declare function commandCheck(currStatus: boolean, cci: CommandCheckInfo): CommandCheckInfo;
declare function pingCheck(ip: string): Promise<boolean>;
declare function portCheck(ip: string, port: number): Promise<boolean>;
declare function execRemoteShellCommand(node: {
    ip: string;
    port: number;
    username: string;
    password: string;
}, shellCommand: string): Promise<string>;
export { pingCheck, portCheck, execRemoteShellCommand, commandCheck };
