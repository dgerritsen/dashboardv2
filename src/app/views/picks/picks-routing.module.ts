import { NgModule } from '@angular/core';
import { Routes,
  RouterModule } from '@angular/router';

import {PicksComponent} from './picks.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'now',
    pathMatch: 'full',
  },
  {
    path: '',
    component: PicksComponent,
    data: {
      title: 'Dashboard'
    },
    children: [
      {
        path: 'now',
        data: {
          title: 'Actueel',
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PicksRoutingModule {}
