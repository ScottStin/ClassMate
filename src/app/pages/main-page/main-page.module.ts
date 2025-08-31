import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SideNavModule } from 'src/app/components/side-nav/side-nav.module';

import { ExamPageModule } from '../exam-page/exam-page.module';
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
    LessonPageModule,
    UserPageModule,
    ExamPageModule,
  ],
  providers: [],
})
export class MainPageModule {}
