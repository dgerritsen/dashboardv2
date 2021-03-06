import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'now',
    pathMatch: 'full',
  },
  {
    path: '',
    component: DashboardComponent,
    data: {
      title: 'Magazijn'
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
export class DashboardRoutingModule {}
