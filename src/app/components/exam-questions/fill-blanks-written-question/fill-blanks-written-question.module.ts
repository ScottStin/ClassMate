import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { FillBlanksWrittenQuestionComponent } from './fill-blanks-written-question.component';

@NgModule({
  declarations: [FillBlanksWrittenQuestionComponent],
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatSelectModule,
  ],
  exports: [FillBlanksWrittenQuestionComponent],
})
export class FillBlanksWrittenQuestionModule {}
