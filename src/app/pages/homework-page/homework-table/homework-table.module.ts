import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StudentsIncompleteHomeworkDialogModule } from 'src/app/components/students-incomplete-homework-dialog/students-incomplete-homework-dialog.module';

import { HomeworkTableComponent } from './homework-table.component';

@NgModule({
  declarations: [HomeworkTableComponent],
  imports: [
    CommonModule,
    MatSortModule,
    MatTableModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule,
    StudentsIncompleteHomeworkDialogModule,
  ],
  exports: [HomeworkTableComponent],
})
export class HomeworkTableModule {}
