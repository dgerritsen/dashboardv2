import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { AppComponent } from './app.component';

// Import containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';

const APP_CONTAINERS = [
  DefaultLayoutComponent
];

import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  AppSidebarModule,
} from '@coreui/angular'

// Import routing module
import { AppRoutingModule } from './app.routing';

// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import {Xml2jsService} from "./services/xml2js.service";
import { DatascreenComponent } from './datascreen/datascreen.component';
import {SalesModule} from './views/sales/sales.module';
import {RestangularModule} from 'ngx-restangular';
import {NgxEchartsModule} from 'ngx-echarts';

export function RestangularConfigFactory (RestangularProvider) {
  RestangularProvider.setBaseUrl('https://api.salo.nl/api/v1/Reporting/');
  RestangularProvider.setDefaultHeaders({'Authorization': 'Token a+Vu0zT8WqXgyMKG4YjvlXGbcfAoXyykjn3kZHUGj3U='});
}

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    SalesModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    RestangularModule.forRoot(RestangularConfigFactory),
    ChartsModule,
    NgxEchartsModule,
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    P404Component,
    P500Component,
    LoginComponent,
    RegisterComponent,
    DatascreenComponent,
  ],
  providers: [{
    provide: LocationStrategy,
    useClass: HashLocationStrategy
  }, Xml2jsService],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
