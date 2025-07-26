import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { FillBlanksWrittenQuestionComponent } from './fill-blanks-written-question.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [FillBlanksWrittenQuestionComponent],
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
  ],
  exports: [FillBlanksWrittenQuestionComponent],
})
export class FillBlanksWrittenQuestionModule {}
