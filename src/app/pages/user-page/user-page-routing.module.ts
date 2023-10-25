/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserPageComponent } from './user-page.component';

const routes: Routes = [
  {
    path: '',
    component: UserPageComponent,
    children: [
        {
          path: 'teachers',
          component: UserPageComponent,
        },
        {
          path: 'classmates',
          component: UserPageComponent,
        },
        {
          path: 'students',
          component: UserPageComponent,
        },
        {
          path: 'colleagues',
          component: UserPageComponent,
        },
        {
          path: '',
          pathMatch: 'prefix',
          redirectTo: 'login',
        },
      ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserPageRoutingModule {}
