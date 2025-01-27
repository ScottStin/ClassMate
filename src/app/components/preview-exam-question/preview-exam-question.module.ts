import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { QuestionsModule } from '../questions/questions.module';
import { PreviewExamQuestionComponent } from './preview-exam-question.component';

@NgModule({
  declarations: [PreviewExamQuestionComponent],
  imports: [CommonModule, QuestionsModule, DialogHeaderModule, MatDialogModule],

  exports: [PreviewExamQuestionComponent],
})
export class PreviewExamQuestionModule {}
