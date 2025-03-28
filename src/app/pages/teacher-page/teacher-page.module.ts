import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';
import { LessonCardModule } from 'src/app/pages/lesson-page/lesson-card/lesson-card.module';
import { UserCardModule } from 'src/app/pages/user-page/user-card/user-card.module';
import { UserTableModule } from 'src/app/pages/user-page/user-table/user-table.module';

import { TeacherPageComponent } from './teacher-page.component';

@NgModule({
  declarations: [TeacherPageComponent],
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatTabsModule,
    HeaderCardModule,
    LessonCardModule,
    UserCardModule,
    UserTableModule,
  ],
  exports: [TeacherPageComponent],
})
export class TeacherPageModule {}
