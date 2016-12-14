import { Component } from "@angular/core";

@Component({
  selector: 'monitor',
  templateUrl: 'app/app.component.html',
  styleUrls: ['app/app.component.css']
})

export class AppComponent {
  b = false


  ser_test = [
    ['10.65.193.11', 'whpay'],
    ['10.65.193.27', 'whdb2'],
    ['10.65.193.40', 'dwdb'],
    ['10.65.193.37', 'cloud'],
    ['10.65.193.20', 'jyhdb'],
    ['10.65.193.38', 'fun3']
  ]
  ser_dev = [
    ['10.65.193.12', 'whpay'],
    ['10.65.193.21', 'dev2'],
    ['10.65.193.28', 'wh12'],
    ['10.65.193.39', 'dev3']
  ]
  ser_yali = [
    ['10.65.212.193', 'orayali'],
    ['10.65.193.25', 'orayali2'],
    ['10.65.193.26', 'orayali3']
  ]
  ser_lt = [
    ['10.65.193.13', 'whlt']
  ]
}
