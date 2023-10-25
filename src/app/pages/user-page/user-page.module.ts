import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';
import { LessonCardModule } from 'src/app/components/lesson-card/lesson-card.module';
import { UserCardModule } from 'src/app/components/user-card/user-card.module';

import { UserPageComponent } from './user-page.component';
import { UserPageRoutingModule } from './user-page-routing.module';

@NgModule({
  declarations: [UserPageComponent],
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatTabsModule,
    HeaderCardModule,
    UserPageRoutingModule,
    LessonCardModule,
    UserCardModule,
  ],
  exports: [UserPageComponent],
})
export class UserPageModule {}
