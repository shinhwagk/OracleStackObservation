import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NodesComponent } from "./nodes.component";
import { ReportOsComponent } from "./report.os.component";
import { ReportDatabaseComponent } from "./report.database.component";
import { AlertDatabaseComponent } from "./alert.database.component";
import { AlertsComponent } from './alert.component';

const routes: Routes = [
  { path: '', redirectTo: '/nodes', pathMatch: 'full' },
  { path: 'nodes', component: NodesComponent },
  { path: 'report/os/:ip', component: ReportOsComponent },
  { path: 'report/oracle/:ip/:service', component: ReportDatabaseComponent },
  { path: 'alert/oracle/:ip/:service/:alerts', component: AlertDatabaseComponent },
  { path: 'alerts', component: AlertsComponent}
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}