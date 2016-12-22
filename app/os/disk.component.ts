import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Location } from "@angular/common";

import { ApiServices } from "../api.services";
import { node } from '../node';

@Component({
  selector: 'os-dist',
  templateUrl: 'app/os/diskcomponent.html',
  styleUrls: ['app/os/disk.component.css'],
  providers: [ApiServices]
})

export class DiskComponent implements OnInit {
  ngOnInit(): void {
    this._api.getNodes().toPromise().then((notes: node[]) => {
      notes.forEach(note => this.getDiskInfo(note.ip))
    })
  }

  constructor(private _api: ApiServices,
    private route: ActivatedRoute,
    private location: Location) {
  }

  _ips: string[] = []
  _disk = new Map<string, Array<any>>()
  _report = []

  getDiskInfo(ip: string) {
    this._api.getOSReportByName(ip, "disk_space").toPromise().then(diskinfo => {
      this._disk.set(ip, diskinfo)
      this._report = Array.from(this._disk).slice()
    })
  }

  goBack(): void {
    this.location.back();
  }
}