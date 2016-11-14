import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Location } from "@angular/common";

import { ApiServices } from "./api.services";

@Component({
  moduleId: module.id,
  selector: 'alert-database',
  templateUrl: 'alert.database.component.html',
  styleUrls: ['alert.database.component.css'],
  providers: [ApiServices]
})

export class AlertDatabaseComponent implements OnInit {
  ngOnInit(): void {
    this.route.params.forEach((params: Params) => {
      this.ip = params['ip'];
      this.service = params['service'];
      this.alerts = JSON.parse(params['alerts'])
      this.alerts.forEach(name => this.getAlertByName(name))
    })
  }

  constructor(private _api: ApiServices,
    private route: ActivatedRoute,
    private location: Location) {
  }

  ip: string
  service: string
  alerts: string[]
  //
  date = new Date()
  names: string[]
  //
  report_a = new Map<string, Array<any>>()
  report = []

  getAlertByName(name: string): void {
    console.info(name, 11)
    this._api.getDBAlerttByName(this.ip, this.service, name).toPromise().then(str => {
      this.report_a.set(name, str)
      this.report = Array.from(this.report_a).slice()
    })
  }

  goBack(): void {
    this.location.back();
  }
}