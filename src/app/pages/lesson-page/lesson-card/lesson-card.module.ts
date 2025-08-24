import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EnrollStudentDialogModule } from '../../../components/enroll-student-dialog/enroll-student-dialog.module';
import { StudentsEnrolledLessonDialogModule } from '../../../components/students-enrolled-lesson-dialog/students-enrolled-lesson-dialog.module';
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
    EnrollStudentDialogModule,
    MatDialogModule,
    MatMenuModule,
  ],
  exports: [LessonCardComponent],
})
export class LessonCardModule {}
