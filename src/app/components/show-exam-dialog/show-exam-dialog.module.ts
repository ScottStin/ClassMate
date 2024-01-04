import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';

import { QuestionsModule } from '../questions/questions.module';
import { ShowExamDialogComponent } from './show-exam-dialog.component';

@NgModule({
  declarations: [ShowExamDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatListModule,
    QuestionsModule,
  ],
  exports: [ShowExamDialogComponent],
})
export class ShowExamDialogModule {}
