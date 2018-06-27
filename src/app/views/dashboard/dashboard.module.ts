import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import {Xml2jsService} from '../../services/xml2js.service';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {ProgressbarModule} from 'ngx-bootstrap/progressbar';

@NgModule({
  imports: [
    FormsModule,
    DashboardRoutingModule,
    ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    ProgressbarModule.forRoot(),
    HttpClientModule,
    CommonModule,
    NgxDatatableModule,
  ],
  declarations: [ DashboardComponent ],
  providers: [
    Xml2jsService,
  ]
})
export class DashboardModule { }
