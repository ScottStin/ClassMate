import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { ErrorMessageModule } from '../error-message/error-message.module';
import { QuestionsModule } from '../questions/questions.module';
import { ShowExamDialogComponent } from './show-exam-dialog.component';

@NgModule({
  declarations: [ShowExamDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatListModule,
    QuestionsModule,
    MatDividerModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    DialogHeaderModule,
    ErrorMessageModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTooltipModule,
  ],
  exports: [ShowExamDialogComponent],
})
export class ShowExamDialogModule {}
