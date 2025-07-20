import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CreateLessonFormModule } from '../create-lesson-dialog/create-lesson-form/create-lesson-form.module';
import { DialogActionsModule } from '../dialog-actions/dialog-actions.module';
import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { ErrorMessageModule } from '../error-message/error-message.module';
import { EditLessonDialogComponent } from './edit-lesson-dialog.component';

@NgModule({
  declarations: [EditLessonDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    ErrorMessageModule,
    DialogActionsModule,
    DialogHeaderModule,
    CreateLessonFormModule,
  ],
  exports: [EditLessonDialogComponent],
})
export class EditLessonDialogModule {}
