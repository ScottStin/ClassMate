import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DialogActionsModule } from '../dialog-actions/dialog-actions.module';
import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { CreateLessonDialogComponent } from './create-lesson-dialog.component';
import { CreateLessonFormModule } from './create-lesson-form/create-lesson-form.module';

@NgModule({
  declarations: [CreateLessonDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    MatButtonToggleModule,
    DialogActionsModule,
    DialogHeaderModule,
    CreateLessonFormModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  exports: [CreateLessonDialogComponent],
})
export class CreateLessonDialogModule {}
