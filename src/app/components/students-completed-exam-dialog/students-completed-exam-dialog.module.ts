import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';

import { StudentsCompletedExamDialogComponent } from './students-completed-exam-dialog.component';

@NgModule({
  declarations: [StudentsCompletedExamDialogComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatListModule,
    MatTabsModule,
  ],
  exports: [StudentsCompletedExamDialogComponent],
})
export class StudentsCompletedExamDialogModule {}
