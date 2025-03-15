import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { StudentsCompletedExamDialogModule } from '../../../components/students-completed-exam-dialog/students-completed-exam-dialog.module';
import { ExamTableComponent } from './exam-table.component';

@NgModule({
  declarations: [ExamTableComponent],
  imports: [
    CommonModule,
    MatSortModule,
    MatTableModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule,
    StudentsCompletedExamDialogModule,
  ],
  exports: [ExamTableComponent],
})
export class ExamTableModule {}
