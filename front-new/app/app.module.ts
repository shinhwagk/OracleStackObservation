import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import './rxjs-extensions';
import {ModalModule} from 'angular2-modal';
import {BootstrapModalModule} from 'angular2-modal/plugins/bootstrap';

import {AppComponent} from './app.component'
import {NodesComponent} from "./nodes.component";
import {FFFComponent} from './fff.component'
import {ReportDatabaseComponent} from "./report.database.component";
import {ReportOsComponent} from "./report.os.component";

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    ModalModule.forRoot(),
    BootstrapModalModule
  ],
  declarations: [
    AppComponent,
    NodesComponent,
    FFFComponent,
    ReportDatabaseComponent,
    ReportOsComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}