import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

import { MultiChoiceQuestionComponent } from './multi-choice-question.component';

@NgModule({
  declarations: [MultiChoiceQuestionComponent],
  imports: [
    CommonModule,
    MatRadioModule,
    FormsModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  exports: [MultiChoiceQuestionComponent],
})
export class MultiChoiceQuestionModule {}
