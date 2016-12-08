import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Params} from "@angular/router";
import {Location} from "@angular/common";

import {ApiServices} from "./api.services";

@Component({
  moduleId: module.id,
  selector: 'report-database',
  templateUrl: 'report.database.component.html',
  styleUrls: ['report.database.component.css'],
  providers: [ApiServices]
})

export class ReportDatabaseComponent implements OnInit {
  ngOnInit(): void {
    this.route.params.forEach((params: Params) => {
      this.ip = params['ip'];
      this.service = params['service'];
      console.info(this.ip)

        this._api.getDBReportNames(this.ip, this.service).toPromise().then((names: string[]) => {
          this.names = names
          this.names.forEach(name => this.report_a.set(name, []))

          this.report = Array.from(this.report_a)
          this.names.forEach(name => {
            this.getReportByName(name)
          })
        })
    })
  }

  //
  //
  constructor(private _api: ApiServices,
              private route: ActivatedRoute,
              private location: Location) {
  }

  //
  ip: string
  service: string
  //
  date = new Date()
  names: string[]
  //
  report_a = new Map<string, Array<any>>()
  report = []

  getReportByName(name: string): void {
    this._api.getDBReportByName(this.ip, this.service, name).toPromise().then(str => {
      this.report_a.set(name, str)
      this.report = Array.from(this.report_a).slice()
    })
  }

  goBack(): void {
    this.location.back();
  }
}