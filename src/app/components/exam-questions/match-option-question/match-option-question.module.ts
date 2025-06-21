import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { MatchOptionQuestionComponent } from './match-option-question.component';

@NgModule({
  declarations: [MatchOptionQuestionComponent],
  imports: [CommonModule, DragDropModule, MatIconModule],
  exports: [MatchOptionQuestionComponent],
})
export class MatchOptionQuestionModule {}
