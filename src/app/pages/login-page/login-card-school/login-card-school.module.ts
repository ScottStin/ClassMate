import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { ImageCropperModule } from 'ngx-image-cropper';

import { ErrorMessageModule } from '../../../components/error-message/error-message.module';
import { SchoolLoginRedirectorModule } from '../../../components/school-login-redirector/school-login-redirector.module';
import { LoginCardSchoolComponent } from './login-card-school.component';

@NgModule({
  declarations: [LoginCardSchoolComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    ErrorMessageModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    ImageCropperModule,
    MatStepperModule,
    MatListModule,
    MatButtonToggleModule,
    MatSliderModule,
    SchoolLoginRedirectorModule,
  ],
  exports: [LoginCardSchoolComponent],
})
export class LoginCardSchoolModule {}
