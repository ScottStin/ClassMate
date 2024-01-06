import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { StudentsCompletedExamDialogComponent } from './students-completed-exam-dialog.component';

@NgModule({
  declarations: [StudentsCompletedExamDialogComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatListModule,
    MatTabsModule,
    MatGridListModule,
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [StudentsCompletedExamDialogComponent],
})
export class StudentsCompletedExamDialogModule {}
