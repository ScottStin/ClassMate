/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthTeacherGuard } from 'src/app/core/guards/auth-teacher.guard';

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
          canActivate: [AuthTeacherGuard],
          component: UserPageComponent,
          data: { userType: 'Student', pageType: 'Table' },
        },
        {
          path: 'colleagues',
          canActivate: [AuthTeacherGuard],
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
