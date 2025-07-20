import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CronEditorModule } from 'ngx-cron-editor';

import { ErrorMessageModule } from '../../error-message/error-message.module';
import { CreateLessonFormComponent } from './create-lesson-form.component';

@NgModule({
  declarations: [CreateLessonFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CronEditorModule,
    ErrorMessageModule,
    MatOptionModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
  ],
  exports: [CreateLessonFormComponent],
})
export class CreateLessonFormModule {}
