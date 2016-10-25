/**
 * Created by zhangxu on 2016/8/3.
 */
import {Component, OnInit} from "@angular/core";
import {ApiServices} from "./api.services";

@Component({
  selector: 'monitor-nodes',
  templateUrl: 'app/nodes.component.html',
  styleUrls: ['app/nodes.component.css'],
  providers: [ApiServices]
})

export class NodesComponent implements OnInit {
  ngOnInit() {
    this._api.getNodes().toPromise().then(nodes => this._nodes = nodes)
    this._api.getDBAlert().toPromise().then(alerts => this.alertdb = alerts)
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

  _nodes = []
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
  alertdb = []

  getAlertsByDB(ip: string, service: string): string[] {
    console.info(this.alertdb)
    console.info(this.alertdb.filter(ad => ad[0] == ip && ad[1] == service).map(ad => ad[2]))
    return this.alertdb.filter(ad => ad[0] == ip && ad[1] == service).map(ad => ad[2])
  }

  _stream_data() {
    setInterval(() => this._api.getNodes().toPromise().then(nodes => this._nodes = nodes), 5000)
    setInterval(() => this._api.getDBAlert().toPromise().then(alerts => this.alertdb = alerts), 5000)
    // this.ws.send("a")
    // this.ws.onmessage = (ev: MessageEvent) => {
    //   this._nodes = JSON.parse(ev.data)
    //   console.info(this._nodes)
    //   this._nodes = this._nodes.sort((a, b) => {
    //     let na: number = this._status_order(a.status)
    //     let nb: number = this._status_order(b.status)

    //     if (na > nb) {
    //       return 1;
    //     }
    //     if (na < nb) {
    //       return -1;
    //     }
    //     return 0;
    //   })
    //   this._nodes.forEach(p => this._make_evn_group(p))
    // }
  }

  // alert: { hostname: string, alert: string[] }[] = []

  constructor(private _api: ApiServices) {
    this._stream_data()
    // this._api.getAlert().toPromise().then(alert => this.alert = alert)
  }


  // getAlert(hostname) {
  //   console.info(this.alert.filter(a => a.hostname == hostname)[0].alert)
  //   return this.alert.filter(a => a.hostname == hostname)[0].alert
  // }

  // _make_evn_group(n: node) {
  //   let env = n.environment
  //   if (this._node_envs.indexOf(env, 0) < 0) {
  //     this._node_envs.push(env)
  //   }
  // }

  _env_filter(env) {
    return this._nodes.filter(p => p.title == env)
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