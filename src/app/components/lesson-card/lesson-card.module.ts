import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AddStudentToLessonDialogModule } from '../add-student-to-lesson-dialog/add-student-to-lesson-dialog.module';
import { StudentsEnrolledLessonDialogModule } from '../students-enrolled-lesson-dialog/students-enrolled-lesson-dialog.module';
import { LessonCardComponent } from './lesson-card.component';

@NgModule({
  declarations: [LessonCardComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    StudentsEnrolledLessonDialogModule,
    AddStudentToLessonDialogModule,
  ],
  exports: [LessonCardComponent],
})
export class LessonCardModule {}
