import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ImageCropperModule } from 'ngx-image-cropper';

import { ErrorMessageModule } from '../../components/error-message/error-message.module';
import { DialogActionsModule } from '../dialog-actions/dialog-actions.module';
import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { EditUserDialogComponent } from './edit-user-dialog.component';

@NgModule({
  declarations: [EditUserDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ErrorMessageModule,
    MatIconModule,
    ImageCropperModule,
    DialogActionsModule,
    DialogHeaderModule,
  ],
  exports: [EditUserDialogComponent],
})
export class EditUserDialogModule {}
