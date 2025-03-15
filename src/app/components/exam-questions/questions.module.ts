import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { AudioResponseQuestionModule } from './audio-response-question/audio-response-question.module';
import { QuestionsComponent } from './questions.component';
import { WrittenResponseQuestionModule } from './written-response-question/written-response-question.module';

@NgModule({
  declarations: [QuestionsComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    WrittenResponseQuestionModule,
    AudioResponseQuestionModule,
  ],

  exports: [QuestionsComponent],
})
export class QuestionsModule {}
