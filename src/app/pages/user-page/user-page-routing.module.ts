/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserPageComponent } from './user-page.component';

const routes: Routes = [
  {
    path: '',
    children: [
        {
          path: 'teachers',
          component: UserPageComponent,
          data: { userType: 'Teacher', pageType: 'Card' },
        },
        {
          path: 'classmates',
          component: UserPageComponent,
          data: { userType: 'Student', pageType: 'Card' },
        },
        {
          path: 'students',
          component: UserPageComponent,
          data: { userType: 'Student', pageType: 'Table' },
        },
        {
          path: 'colleagues',
          component: UserPageComponent,
          data: { userType: 'Teacher', pageType: 'Card' },
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
