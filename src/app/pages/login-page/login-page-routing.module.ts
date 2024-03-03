/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginPageComponent } from './login-page.component';

const routes: Routes = [
  {
    path: '',
    component: LoginPageComponent,
    children: [
      {
        path: 'login',
        component: LoginPageComponent,
        data: {pageType: 'login'}
      },
      {
        path: 'signup',
        component: LoginPageComponent,
        data: {pageType: 'signup'}
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
export class LoginPageRoutingModule {}
