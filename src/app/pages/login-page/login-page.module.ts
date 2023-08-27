import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoginCardModule } from 'src/app/components/login-card/login-card.module';

import { LoginPageComponent } from './login-page.component';
import { LoginPageRoutingModule } from './login-page-routing.module';

@NgModule({
  declarations: [LoginPageComponent],
  imports: [CommonModule, LoginPageRoutingModule, LoginCardModule],
})
export class LoginPageModule {}
