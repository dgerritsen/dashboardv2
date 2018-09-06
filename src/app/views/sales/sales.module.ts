import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {FormsModule} from "@angular/forms";
import {ChartsModule} from "ng2-charts";
import {BsDropdownModule, ButtonsModule, ProgressbarModule} from "ngx-bootstrap";
import {RestangularModule} from 'ngx-restangular'
import {SalesComponent} from './sales.component'
import {SalesRoutingModule} from './sales-routing.module'

export function RestangularConfigFactory (RestangularProvider) {
  RestangularProvider.setBaseUrl('https://api.salo.nl/api/v1/Reporting/');
  RestangularProvider.setDefaultHeaders({'Authorization': 'Token a+Vu0zT8WqXgyMKG4YjvlXGbcfAoXyykjn3kZHUGj3U='});
}

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    NgxDatatableModule,
    FormsModule,
    SalesRoutingModule,
    ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    ProgressbarModule.forRoot(),
  ],
  declarations: [SalesComponent]
})
export class SalesModule { }
