import {Component, OnInit, Input} from "@angular/core";
import {node} from "./node";
import {ApiServices} from "./api.services"

@Component({
  selector: 'report-database',
  templateUrl: 'app/report.database.component.html',
  styleUrls: ['app/report.database.component.css'],
  providers: [ApiServices]
})

export class ReportDatabaseComponent implements OnInit {
  ngOnInit(): void {
    this._api.getDBReportNames(this.ip, this.service).toPromise().then((names: string[])=> this.names = names)
  }

  constructor(private _api: ApiServices) {
  }

  @Input() ip: string
  @Input() service: string

  names: string[]

  report = new Map<string,string>()

  getReportByName(name: string): void {
    this._api.getDBReportByName(this.ip, this.service, name).toPromise().then(str=>this.report.set(name, str))
  }
}