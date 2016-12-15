import { Component, OnInit } from '@angular/core';
import { ApiServices } from './api.services';
import { node } from './node';

@Component({
  selector: 'alerts',
  template: `
    <div *ngFor="let n of rsarr">
      <h3> {{ n[0] }} </h3>
      <div *ngFor="let i of n[1]">
        <h4>{{ i[0] }}</h4>
        <div *ngFor="let d of i[1]">
          {{ d | json }}
        </div>
      </div>
    </div>
  `,
  providers: [ApiServices]
})

export class AlertsComponent implements OnInit {
  ngOnInit() {
    this._api.getNodeInfo().toPromise().then(nodes => {
      const alertNodes = nodes.filter(node => node.databases[0].alert.length >= 1)
      alertNodes.forEach(node => {
        const ip = node.ip
        const service = node.databases[0].service
        const alerts: string[] = node.databases[0].alert
        const alertMap = new Map<string, Array<any>>()
        this.rs.set(ip + " " + service, alertMap)
        alerts.forEach(name => this.getAlertByName(ip, service, name))
      })
    })
  }

  report_a = new Map<string, Array<any>>()

  rs = new Map<string, Map<string, Array<any>>>()

  rsarr = []

  constructor(private _api: ApiServices) { }

  getAlertByName(ip, service, name: string): void {
    this._api.getDBAlerttByName(ip, service, name).toPromise().then(str => {
      this.rs.get(ip + " " + service).set(name, str)
      this.rsarr = JSON.parse(JSON.stringify(this.rs))
      // this.report_a.set(name, str)
      // this.report = Array.from(this.report_a).slice()
    })
  }
}