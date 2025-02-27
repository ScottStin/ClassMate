import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ConfirmDialogModule } from '../../confirm-dialog/confirm-dialog.module';
import { DialogActionsModule } from '../../dialog-actions/dialog-actions.module';
import { DialogHeaderModule } from '../../dialog-header/dialog-header.module';
import { CreateMultipleChoiceExamQuestionDialogComponent } from './create-multiple-choice-exam-question-dialog.component';

@NgModule({
  declarations: [CreateMultipleChoiceExamQuestionDialogComponent],
  imports: [
    CommonModule,
    DialogHeaderModule,
    MatCheckboxModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    DialogActionsModule,
    MatButtonModule,
    ConfirmDialogModule,
  ],
  exports: [CreateMultipleChoiceExamQuestionDialogComponent],
})
export class CreateMultipleChoiceExamQuestionDialogModule {}
