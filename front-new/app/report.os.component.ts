import {Component, OnInit, Input} from "@angular/core";
import {node} from "./node";
import {ApiServices} from "./api.services"
import {isUndefined} from "util";

@Component({
  selector: 'report-os',
  templateUrl: 'app/report.os.component.html',
  styleUrls: ['app/report.os.component.css'],
  providers: [ApiServices]
})

export class ReportOsComponent implements OnInit {
  ngOnInit(): void {
    this._api.getOSReportNames(this.ip).toPromise().then((names: string[])=> {
      this.names = names
      this.names.forEach(name=>this.report_a.set(name, []))

      this.report = Array.from(this.report_a)
      this.names.forEach(name=> {
        this.getReportByName(name)
      })
    })
  }

  constructor(private _api: ApiServices) {
  }

  @Input() ip: string

  date = new Date()
  names: string[]

  report_a = new Map<string,Array<any>>()
  report = []

  getReportByName(name: string): void {
    this._api.getOSReportByName(this.ip, name).toPromise().then(str=> {
      this.report_a.set(name, str)
      this.report = Array.from(this.report_a).slice()
    })
  }
}