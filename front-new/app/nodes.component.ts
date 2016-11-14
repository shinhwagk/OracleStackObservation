/**
 * Created by zhangxu on 2016/8/3.
 */
import { Component, OnInit } from "@angular/core";
import { ApiServices } from "./api.services";
import { Node } from "./node.class";
import { CheckStatus } from "./checkstatus.enum";
import { Router } from "@angular/router";

@Component({
  moduleId: module.id,
  selector: 'monitor-nodes',
  templateUrl: 'nodes.component.html',
  styleUrls: ['nodes.component.css'],
  providers: [ApiServices]
})

export class NodesComponent implements OnInit {
  ngOnInit() {
    this.genNodes()
    setInterval(() => this.genNodes(), 2000)
  }

  genNodes() {
    this._api.getNodes().toPromise().then(nodes => this._nodes = nodes)
  }

  gotoReportOS(ip: string): void {
    this.router.navigate(['/report/os', ip]);
  }

  gotoReportDatabase(ip: string, service: string): void {
    this.router.navigate(['/report/oracle', ip, service]);
  }

  gotoAlertDatabase(ip: string, service: string, alerts): void {
    // const alerts = this._nodes.filter(n => n.ip === ip)[0].databases.filter(d => d.servcie === service)[0].alter
    this.router.navigate(['/alert/oracle', ip, service, JSON.stringify(alerts)]);
  }

  bb = {}
  //
  // getbbb(ip) {
  //   return this.bb[ip]
  // }

  // nodeCheck(ip:string){
  //   this._api.getNodeCheck(ip).toPromise().then(bool=>bool)
  // }

  reportDatabase(ip, service) {
    this.ip = ip
    this.service = service
    if (this.ff) {
      this.ff = false
    } else {
      this.ff = true
    }
  }

  reportOS(ip) {
    this.ip = ip
    if (this.gg) {
      this.gg = false
    } else {
      this.gg = true
    }
  }

  ff = false
  gg = false
  ip: string
  service: string

  _nodes: Node[] = []
  // _nodes: node[] = []
  _node_envs: string[] = ["test", "dev", "yali", "lt"]
  // ws: WebSocket = new WebSocket("ws://10.65.103.15:9000/api/nodes");


  // _status_order(s: string): number {
  //   switch (s) {
  //     case "doubt":
  //       return 2;
  //     case "normal":
  //       return 3;
  //     case "die":
  //       return 1;
  //     default:
  //       return 4;
  //   }
  // }
  // alertdb = []
  //
  // getAlertsByDB(ip: string, service: string): string[] {
  //   console.info(this.alertdb)
  //   console.info(this.alertdb.filter(ad => ad[0] == ip && ad[1] == service).map(ad => ad[2]))
  //   return this.alertdb.filter(ad => ad[0] == ip && ad[1] == service).map(ad => ad[2])
  // }

  // _stream_data() {
  //
  //   // setInterval(() => this._api.getDBAlert().toPromise().then(alerts => this.alertdb = alerts), 5000)
  // }

  constructor(private _api: ApiServices,
    private router: Router) {

  }

  _env_filter(env) {
    return this._nodes.filter(node => node.title == env)
  }

  setStyles(status: CheckStatus) {
    if (status === CheckStatus.NORMAL) {
      return { 'color': '#00AA00' }
    } else if (status === CheckStatus.DOUBT) {
      return { 'color': 'yellow' }
    } else if (status === CheckStatus.STOP) {
      return { 'color': 'Silver' }
    } else {
      return { 'color': 'red' }
    }
  }

  checkStatus = CheckStatus

}