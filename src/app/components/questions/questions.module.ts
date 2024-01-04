import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ErrorMessageModule } from '../error-message/error-message.module';
import { QuestionsComponent } from './questions.component';
import { WrittenResponseQuestionComponent } from './written-response-question/written-response-question.component';

@NgModule({
  declarations: [QuestionsComponent, WrittenResponseQuestionComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    ErrorMessageModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
  ],

  exports: [QuestionsComponent],
})
export class QuestionsModule {}
