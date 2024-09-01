import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { WelcomePageComponent } from './welcome-page.component';
import { WelcomePageRoutingModule } from './welcome-page-routing.module';

@NgModule({
  declarations: [WelcomePageComponent],
  imports: [CommonModule, WelcomePageRoutingModule, RouterModule],
  exports: [WelcomePageComponent],
})
export class WelcomePageModule {}
