/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TeacherPageComponent } from '../teacher-page/teacher-page.component';
import { UserPageComponent } from './user-page.component';

const routes: Routes = [
  {
    path: '',
    children: [
        {
          path: 'teachers',
          component: TeacherPageComponent,
          data: { userType: 'Teacher' },
        },
        {
          path: 'classmates',
          component: TeacherPageComponent,
          data: { userType: 'Student' },
        },
        {
          path: 'students',
          component: UserPageComponent,
        },
        {
          path: 'colleagues',
          component: TeacherPageComponent,
          data: { userType: 'Teacher' },
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
