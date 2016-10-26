/**
 * Created by zhangxu on 2016/8/3.
 */
import {Component, OnInit} from "@angular/core";
import {ApiServices} from "./api.services";
import {Node} from './node.class'

@Component({
  selector: 'monitor-nodes',
  templateUrl: 'app/nodes.component.html',
  styleUrls: ['app/nodes.component.css'],
  providers: [ApiServices]
})

export class NodesComponent implements OnInit {
  ngOnInit() {
    this._api.getNodes().toPromise().then(nodes => this._nodes = nodes)
    setInterval(() => this._api.getNodes().toPromise().then(nodes => this._nodes = nodes), 5000)
  }

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

  fff(){
    return this._api.getxxx()
  }
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
  alertdb = []

  getAlertsByDB(ip: string, service: string): string[] {
    console.info(this.alertdb)
    console.info(this.alertdb.filter(ad => ad[0] == ip && ad[1] == service).map(ad => ad[2]))
    return this.alertdb.filter(ad => ad[0] == ip && ad[1] == service).map(ad => ad[2])
  }

  // _stream_data() {
  //
  //   // setInterval(() => this._api.getDBAlert().toPromise().then(alerts => this.alertdb = alerts), 5000)
  // }

  constructor(private _api: ApiServices) {
  }

  _env_filter(env) {
    return this._nodes.filter(node => node.title == env)
  }

  setStyles(status: CheckStatus) {
    if (status === CheckStatus.NORMAL) {
      return {'color': '#00AA00'}
    } else if (status === CheckStatus.DOUBT) {
      return {'color': 'yellow'}
    } else if (status === CheckStatus.STOP) {
      return {'color': 'Silver'}
    } else {
      return {'color': 'red'}
    }
  }
}

enum CheckStatus {
  DIE = 1,
  STOP = 2,
  NORMAL = 3,
  DOUBT = 4
}