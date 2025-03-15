import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfirmDialogModule } from 'src/app/components/confirm-dialog/confirm-dialog.module';
import { CreateLessonDialogModule } from 'src/app/components/create-lesson-dialog/create-lesson-dialog.module';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';
import { LessonCardModule } from 'src/app/pages/lesson-page/lesson-card/lesson-card.module';

import { LessonPageComponent } from './lesson-page.component';
import { LessonPageRoutingModule } from './lesson-page-routing.module';

@NgModule({
  declarations: [LessonPageComponent],
  imports: [
    MatButtonModule,
    CommonModule,
    LessonPageRoutingModule,
    MatTabsModule,
    LessonCardModule,
    MatIconModule,
    MatProgressBarModule,
    HeaderCardModule,
    CreateLessonDialogModule,
    ConfirmDialogModule,
  ],
  exports: [LessonPageComponent],
})
export class LessonPageModule {}
