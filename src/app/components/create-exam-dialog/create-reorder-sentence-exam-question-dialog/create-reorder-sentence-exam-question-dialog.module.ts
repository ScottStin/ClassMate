import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ConfirmDialogModule } from '../../confirm-dialog/confirm-dialog.module';
import { DialogActionsModule } from '../../dialog-actions/dialog-actions.module';
import { DialogHeaderModule } from '../../dialog-header/dialog-header.module';
import { CreateReorderSentenceExamQuestionDialogComponent } from './create-reorder-sentence-exam-question-dialog.component';

@NgModule({
  declarations: [CreateReorderSentenceExamQuestionDialogComponent],
  imports: [
    CommonModule,
    DialogActionsModule,
    DialogHeaderModule,
    ConfirmDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatListModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatSelectModule,
    MatInputModule,
  ],
  exports: [CreateReorderSentenceExamQuestionDialogComponent],
})
export class CreateReorderSentenceExamQuestionDialogModule {}
