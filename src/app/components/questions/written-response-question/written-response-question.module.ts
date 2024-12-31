import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ErrorMessageModule } from '../../error-message/error-message.module';
import { WrittenResponseQuestionComponent } from './written-response-question.component';

@NgModule({
  declarations: [WrittenResponseQuestionComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    ErrorMessageModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
  ],
  exports: [WrittenResponseQuestionComponent],
})
export class WrittenResponseQuestionModule {}
