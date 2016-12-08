/**
 * Created by zhangxu on 2016/8/3.
 */
import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";

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

  getDBAlerttByName(ip: string, service: string, name: string) {
    return this._http.get(`/api/alert/oracle/${ip}/${service}/${name}`).map((res: Response) => res.json())
  }
  
  getOSReportNames(ip: string) {
    return this._http.get(`/api/report/os/names/${ip}`).map((res: Response) => res.json())
  }

  getDBReportByName(ip: string, service: string, name: string) {
    return this._http.get(`/api/report/oracle/${ip}/${service}/${name}`).map((res: Response) => res.json())
  }

  getOSReportByName(ip: string, name: string) {
    return this._http.get(`/api/report/os/${ip}/${name}`).map((res: Response) => res.json())
  }

  getNodePingStatus(ip: string) {
    return this._http.get(`/api/monitor/ping/${ip}`).map((res: Response) => res.json())
  }

  getDatabaseNetCateStatus(ip: string, port: number) {
    return this._http.get(`/api/monitor/nc/${ip}/${port}`).map((res: Response) => res.json())
  }

  getxxx() {
    return this._http.get(`/api/nodestest`).map((res: Response) => res.json())
  }

  getNodeCheck(ip: string) {
    return this._http.get(`/api/check/node/${ip}`).map((res: Response) => res.json())
  }
}