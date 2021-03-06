import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PicksComponent } from './picks.component';
import {HttpClientModule} from '@angular/common/http';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {PicksRoutingModule} from "./picks-routing.module";
import {FormsModule} from "@angular/forms";
import {ChartsModule} from "ng2-charts";
import {BsDropdownModule, ButtonsModule, ProgressbarModule} from "ngx-bootstrap";
import {NgxEchartsModule} from 'ngx-echarts';
import {PicksHistoryComponent} from './history.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    NgxDatatableModule,
    FormsModule,
    PicksRoutingModule,
    ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    ProgressbarModule.forRoot(),
    NgxEchartsModule,
  ],
  declarations: [PicksComponent, PicksHistoryComponent]
})
export class PicksModule { }
