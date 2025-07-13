import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { DialogHeaderModule } from '../dialog-header/dialog-header.module';
import { QuestionsModule } from '../exam-questions/questions.module';
import { PreviewExamQuestionComponent } from './preview-exam-question.component';

describe('PreviewExamQuestionComponent', () => {
  let component: PreviewExamQuestionComponent;
  let fixture: ComponentFixture<PreviewExamQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreviewExamQuestionComponent],
      imports: [QuestionsModule, DialogHeaderModule, MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useFactory: (): unknown => ({}),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewExamQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
