import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DialogActionsModule } from '../dialog-actions/dialog-actions.module';
import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { AddStudentToLessonDialogComponent } from './add-student-to-lesson-dialog.component';

@NgModule({
  declarations: [AddStudentToLessonDialogComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatGridListModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    MatCheckboxModule,
    DialogHeaderModule,
    DialogActionsModule,
  ],
  exports: [AddStudentToLessonDialogComponent],
})
export class AddStudentToLessonDialogModule {}
