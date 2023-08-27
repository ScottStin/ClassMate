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
      },
      {
        path: 'signup',
        component: LoginPageComponent,
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
