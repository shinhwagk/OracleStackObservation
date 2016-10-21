/**
 * Created by zhangxu on 2016/8/3.
 */
import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";

@Injectable()
export class ApiServices {
  private _node_info_url: string = '/api/nodes'

  constructor(private _http: Http) {
  }

  getNodeInfo() {
    return this._http.get(this._node_info_url).map((res: Response) => res.json())
  }

  getAlert() {
    return this._http.get("nodes/alert.json").map((res: Response) => res.json())
  }

  getNodes() {
    return this._http.get("/api/nodes").map((res: Response) => res.json())
  }

  getDBAlert() {
    return this._http.get("/api/nodes").map((res: Response) => res.json())
  }

  getDBReportNames(ip: string, service: string) {
    return this._http.get(`/api/report/oracle/names/${ip}/${service}`).map((res: Response) => res.json())
  }

  getDBReportByName(ip: string, service: string, name: string) {
    return this._http.get(`/api/report/oracle/${name}/${ip}/${service}`).map((res: Response) => res.json())
  }
}