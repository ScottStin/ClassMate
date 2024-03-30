import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ErrorMessageModule } from '../../components/error-message/error-message.module';
import { DialogActionsModule } from '../dialog-actions/dialog-actions.module';
import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { SchoolLoginRedirectorComponent } from './school-login-redirector.component';

@NgModule({
  declarations: [SchoolLoginRedirectorComponent],
  imports: [
    CommonModule,
    DialogActionsModule,
    DialogHeaderModule,
    ErrorMessageModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [SchoolLoginRedirectorComponent],
})
export class SchoolLoginRedirectorModule {}
