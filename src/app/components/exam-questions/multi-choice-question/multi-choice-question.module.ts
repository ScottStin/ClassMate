import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { MultiChoiceQuestionComponent } from './multi-choice-question.component';

@NgModule({
  declarations: [MultiChoiceQuestionComponent],
  imports: [CommonModule, MatIconModule, MatListModule, MatCheckboxModule],
  exports: [MultiChoiceQuestionComponent],
})
export class MultiChoiceQuestionModule {}
