import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { DialogActionsModule } from '../../dialog-actions/dialog-actions.module';
import { DialogHeaderModule } from '../../dialog-header/dialog-header.module';
import { ErrorMessageModule } from '../../error-message/error-message.module';
import { GenerateAiQuestionPromptComponent } from './generate-ai-question-prompt.component';

@NgModule({
  declarations: [GenerateAiQuestionPromptComponent],
  imports: [
    CommonModule,
    DialogHeaderModule,
    DialogActionsModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    ErrorMessageModule,
    MatSelectModule,
    MatInputModule,
  ],
  exports: [GenerateAiQuestionPromptComponent],
})
export class GenerateAiQuestionPromptModule {}
