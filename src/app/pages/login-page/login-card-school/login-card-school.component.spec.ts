import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { ImageCropperModule } from 'ngx-image-cropper';

import { ErrorMessageModule } from '../../../components/error-message/error-message.module';
import { SchoolLoginRedirectorModule } from '../../../components/school-login-redirector/school-login-redirector.module';
import { LoginCardSchoolComponent } from './login-card-school.component';

describe('LoginCardSchoolComponent', () => {
  let component: LoginCardSchoolComponent;
  let fixture: ComponentFixture<LoginCardSchoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginCardSchoolComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSliderModule,
        MatStepperModule,
        ImageCropperModule,
        ErrorMessageModule,
        SchoolLoginRedirectorModule,
        MatSnackBarModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginCardSchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
