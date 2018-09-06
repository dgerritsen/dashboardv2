import { NgModule } from '@angular/core';
import { Routes,
  RouterModule } from '@angular/router';

import {PicksComponent} from './picks.component';
import {PicksHistoryComponent} from './history.component'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'now',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Picks'
    },
    children: [
      {
        path: 'now',
        component: PicksComponent,
        data: {
          title: 'Actueel',
        }
      },
      {
        path: 'history',
        component: PicksHistoryComponent,
        data: {
          title: 'Geschiedenis',
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
