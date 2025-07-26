import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { AudioResponseQuestionModule } from './audio-response-question/audio-response-question.module';
import { FillBlanksWrittenQuestionModule } from './fill-blanks-written-question/fill-blanks-written-question.module';
import { MatchOptionQuestionModule } from './match-option-question/match-option-question.module';
import { MultiChoiceQuestionModule } from './multi-choice-question/multi-choice-question.module';
import { QuestionsComponent } from './questions.component';
import { ReorderSentenceQuestionModule } from './reorder-sentence-question/reorder-sentence-question.module';
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
    MultiChoiceQuestionModule,
    ReorderSentenceQuestionModule,
    MatchOptionQuestionModule,
    FillBlanksWrittenQuestionModule,
  ],

  exports: [QuestionsComponent],
})
export class QuestionsModule {}
