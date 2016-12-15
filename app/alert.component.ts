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
          <table border="1">
            <tr>
              <th class="awrbg" *ngFor="let col of i[1][0]"> {{col}}</th>
            </tr>
            <tr *ngFor="let cols of i[1]; let i=index">
              <td [class.awrcgk]="i % 2 == 0" *ngFor="let col of cols">
                <span *ngIf="i >=1">{{col}}</span>
              </td>
            </tr>
          </table>
      </div>
    </div>
  `,
  styles:`
    th.awrbg {
        font: bold 8pt Arial, Helvetica, Geneva, sans-serif;
        color: White;
        background: #0066CC;
        padding-left: 4px;
        padding-right: 4px;
        padding-bottom: 2px
    }

    td {
        font: 8pt Arial, Helvetica, Geneva, sans-serif;
        color: black;
        vertical-align: top;
    }

    td.awrcgk {
        font: 8pt Arial, Helvetica, Geneva, sans-serif;
        color: black;
        background: #FFFFCC;
        vertical-align: top;
    }

    .body {
        font: bold 10pt Arial, Helvetica, Geneva, sans-serif;
        color: black;
        background: White;
        padding: 5px 5px 5px;
    }

    table {
        border-collapse: separate;
    }

    .awr {
        font: bold 19pt Arial, Helvetica, Geneva, sans-serif;
        color: #336699;
        background-color: White;
        border-bottom: 1px solid #cccc99;
        margin-top: 0pt;
        margin-bottom: 0pt;
        padding: 0px 0px 0px 0px;
    }

    p {font-weight: bold}
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