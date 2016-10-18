var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
import { execRemoteShellCommand } from '../common/tools';
function formatDu(str) {
    let arr = str.split("\n");
    arr.pop();
    return arr.map(line => line.split(/\s+/));
}
function abc(ip, port) {
    return __awaiter(this, void 0, void 0, function* () {
        let str = yield execRemoteShellCommand({ ip: "10.65.193.39", port: 22, username: "root", password: "oracle" }, "df -hP | grep -v Filesystem");
        return formatDu(str);
    });
}
//test
abc().then(console.info);
