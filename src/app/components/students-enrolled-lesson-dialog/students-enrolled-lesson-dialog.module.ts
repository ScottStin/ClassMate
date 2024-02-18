import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { StudentsEnrolledLessonDialogComponent } from './students-enrolled-lesson-dialog.component';

@NgModule({
  declarations: [StudentsEnrolledLessonDialogComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatGridListModule,
  ],
  exports: [StudentsEnrolledLessonDialogComponent],
})
export class StudentsEnrolledLessonDialogModule {}
