var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
import * as oracledb from 'oracledb';
export function text(x) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn = yield oracledb.getConnection({
            user: "system",
            password: "wingewq",
            connectString: "122.225.54.25:1521/test"
        });
        let result = yield conn.execute("select * from dual");
        x.body = result.rows;
    });
}
