import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {SalesComponent} from './sales.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'now',
    pathMatch: 'full',
  },
  {
    path: '',
    component: SalesComponent,
    data: {
      title: 'Verkoop'
    },
    children: [
      {
        path: 'now',
        component: SalesComponent,
        data: {
          title: 'Actueel'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule {}
