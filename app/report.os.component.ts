import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Location } from '@angular/common'

import { ApiServices } from "./api.services";

@Component({
  selector: 'report-os',
  templateUrl: 'app/report.os.component.html',
  styleUrls: ['app/report.os.component.css'],
  providers: [ApiServices]
})

export class ReportOsComponent implements OnInit {
  ngOnInit(): void {
    this.route.params.forEach((params: Params) => {
      this.ip = params['ip'];

      this._api.getOSReportNames(this.ip).toPromise().then((names: string[]) => {
        this.names = names
        this.names.forEach(name => this.report_a.set(name, []))

        this.report = Array.from(this.report_a)
        this.names.forEach(name => {
          this.getReportByName(name)
        })
      })
    });
  }

  constructor(private _api: ApiServices,
    private route: ActivatedRoute,
    private location: Location) {
  }

  goBack(): void {
    this.location.back();
  }

  //
  ip: string
  //
  date = new Date()
  names: string[]
  //
  report_a = new Map<string, Array<any>>()
  report = []

  report_err_a = new Map<string, any>()
  report_err = []

  getReportByName(name: string): void {
    
    this.report_a.set(name, [])
    this._api.getOSReportByName(this.ip, name).toPromise().then(str => {
      this.report_a.set(name, str)
      this.report = Array.from(this.report_a).slice()
    }).catch(err => {
      this.report_err_a.set(name, err)
      this.report_err = Array.from(this.report_err_a).slice()
    })
  }
}