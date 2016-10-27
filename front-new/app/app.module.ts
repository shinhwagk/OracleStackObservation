import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import './rxjs-extensions';

import {AppComponent} from './app.component'
import {NodesComponent} from "./nodes.component";
import {ReportDatabaseComponent} from "./report.database.component";
import {ReportOsComponent} from "./report.os.component";

@NgModule({
  imports: [
    BrowserModule,
    HttpModule
  ],
  declarations: [
    AppComponent,
    NodesComponent,
    ReportDatabaseComponent,
    ReportOsComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}