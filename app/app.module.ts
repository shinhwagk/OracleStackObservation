import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import './rxjs-extensions';

import { AppComponent } from './app.component'
import { NodesComponent } from "./nodes.component";
import { ReportDatabaseComponent } from "./report.database.component";
import { AlertDatabaseComponent } from "./alert.database.component";
import { ReportOsComponent } from "./report.os.component";
import { AppRoutingModule } from './app-routing.module';
import { HighlightDirective } from './app.len';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    NodesComponent,
    ReportDatabaseComponent,
    AlertDatabaseComponent,
    ReportOsComponent,
    HighlightDirective
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}