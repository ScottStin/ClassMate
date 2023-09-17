import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SideNavModule } from 'src/app/components/side-nav/side-nav.module';

import { MainPageComponent } from './main-page.component';
import { MainPageRoutingModule } from './main-page-routing.module';

@NgModule({
  declarations: [MainPageComponent],
  imports: [
    CommonModule,
    MainPageRoutingModule,
    MatSidenavModule,
    SideNavModule,
  ],
  providers: [],
})
export class MainPageModule {}
