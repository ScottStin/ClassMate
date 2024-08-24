import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DialogActionsModule } from '../dialog-actions/dialog-actions.module';
import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { StudentsIncompleteHomeworkDialogComponent } from './students-incomplete-homework-dialog.component';

@NgModule({
  declarations: [StudentsIncompleteHomeworkDialogComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatListModule,
    MatTabsModule,
    MatGridListModule,
    MatIconModule,
    MatTooltipModule,
    DialogActionsModule,
    DialogHeaderModule,
  ],
  exports: [StudentsIncompleteHomeworkDialogComponent],
})
export class StudentsIncompleteHomeworkDialogModule {}
