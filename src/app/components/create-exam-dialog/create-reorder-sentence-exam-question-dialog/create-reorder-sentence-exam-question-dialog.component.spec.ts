import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ConfirmDialogModule } from '../../confirm-dialog/confirm-dialog.module';
import { DialogActionsModule } from '../../dialog-actions/dialog-actions.module';
import { DialogHeaderModule } from '../../dialog-header/dialog-header.module';
import { CreateReorderSentenceExamQuestionDialogComponent } from './create-reorder-sentence-exam-question-dialog.component';

describe('CreateReorderSentenceExamQuestionDialogComponent', () => {
  let component: CreateReorderSentenceExamQuestionDialogComponent;
  let fixture: ComponentFixture<CreateReorderSentenceExamQuestionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateReorderSentenceExamQuestionDialogComponent],
      imports: [
        DialogActionsModule,
        DialogHeaderModule,
        ConfirmDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatListModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatSelectModule,
        MatInputModule,
        MatSnackBarModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useFactory: (): unknown => ({}),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      CreateReorderSentenceExamQuestionDialogComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
