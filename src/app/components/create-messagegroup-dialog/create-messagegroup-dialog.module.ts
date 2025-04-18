import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { ImageCropperModule } from 'ngx-image-cropper';

import { DialogActionsModule } from '../dialog-actions/dialog-actions.module';
import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { ErrorMessageModule } from '../error-message/error-message.module';
import { CreateMessagegroupDialogComponent } from './create-messagegroup-dialog.component';

@NgModule({
  declarations: [CreateMessagegroupDialogComponent],
  imports: [
    CommonModule,
    ErrorMessageModule,
    MatIconModule,
    ImageCropperModule,
    DialogActionsModule,
    DialogHeaderModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatListModule,
  ],
  exports: [CreateMessagegroupDialogComponent],
})
export class CreateMessagegroupDialogModule {}
