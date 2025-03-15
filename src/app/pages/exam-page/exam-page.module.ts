import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { CreateExamDialogModule } from 'src/app/components/create-exam-dialog/create-exam-dialog.module';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';
import { ShowExamDialogModule } from 'src/app/components/show-exam-dialog/show-exam-dialog.module';
import { ExamTableModule } from 'src/app/pages/exam-page/exam-table/exam-table.module';

import { ExamPageComponent } from './exam-page.component';
import { ExamPageRoutingModule } from './exam-page-routing.module';

@NgModule({
  declarations: [ExamPageComponent],
  imports: [
    CommonModule,
    ExamPageRoutingModule,
    HeaderCardModule,
    MatProgressBarModule,
    MatTabsModule,
    CreateExamDialogModule,
    ExamTableModule,
    ShowExamDialogModule,
  ],
  exports: [ExamPageComponent],
})
export class ExamPageModule {}
