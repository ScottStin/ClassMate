import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ErrorMessageModule } from '../../components/error-message/error-message.module';
import { DialogActionsModule } from '../dialog-actions/dialog-actions.module';
import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { SchoolLoginRedirectorComponent } from './school-login-redirector.component';

describe('SchoolLoginRedirectorComponent', () => {
  let component: SchoolLoginRedirectorComponent;
  let fixture: ComponentFixture<SchoolLoginRedirectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchoolLoginRedirectorComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ErrorMessageModule,
        DialogActionsModule,
        DialogHeaderModule,
        MatDialogModule,
        FormsModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useFactory: (): unknown => ({}),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SchoolLoginRedirectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
