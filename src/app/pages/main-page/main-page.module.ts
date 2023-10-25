import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FilterCardModule } from 'src/app/components/filter-card/filter-card.module';
import { SideNavModule } from 'src/app/components/side-nav/side-nav.module';

import { LessonPageModule } from '../lesson-page/lesson-page.module';
import { UserPageModule } from '../user-page/user-page.module';
import { MainPageComponent } from './main-page.component';
import { MainPageRoutingModule } from './main-page-routing.module';

@NgModule({
  declarations: [MainPageComponent],
  imports: [
    CommonModule,
    MainPageRoutingModule,
    MatSidenavModule,
    SideNavModule,
    FilterCardModule,
    LessonPageModule,
    UserPageModule,
  ],
  providers: [],
})
export class MainPageModule {}
