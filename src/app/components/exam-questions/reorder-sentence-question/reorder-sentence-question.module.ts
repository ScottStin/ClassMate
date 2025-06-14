import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ReorderSentenceQuestionComponent } from './reorder-sentence-question.component';

@NgModule({
  declarations: [ReorderSentenceQuestionComponent],
  imports: [CommonModule, DragDropModule, MatIconModule],
  exports: [ReorderSentenceQuestionComponent],
})
export class ReorderSentenceQuestionModule {}
