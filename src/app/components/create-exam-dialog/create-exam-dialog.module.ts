import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';

import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { ErrorMessageModule } from '../error-message/error-message.module';
import { CreateExamDialogComponent } from './create-exam-dialog.component';

@NgModule({
  declarations: [CreateExamDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatSlideToggleModule,
    ErrorMessageModule,
    MatStepperModule,
    MatToolbarModule,
    MatCardModule,
    MatTreeModule,
    MatGridListModule,
    MatDividerModule,
    MatCheckboxModule,
    MatListModule,
    DialogHeaderModule,
  ],
  exports: [CreateExamDialogComponent],
})
export class CreateExamDialogModule {}
