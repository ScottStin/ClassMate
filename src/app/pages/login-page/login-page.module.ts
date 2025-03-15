import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoginCardModule } from 'src/app/pages/login-page/login-card/login-card.module';
import { LoginCardSchoolModule } from 'src/app/pages/login-page/login-card-school/login-card-school.module';

import { LoginPageComponent } from './login-page.component';
import { LoginPageRoutingModule } from './login-page-routing.module';

@NgModule({
  declarations: [LoginPageComponent],
  imports: [
    CommonModule,
    LoginPageRoutingModule,
    LoginCardModule,
    LoginCardSchoolModule,
  ],
})
export class LoginPageModule {}
