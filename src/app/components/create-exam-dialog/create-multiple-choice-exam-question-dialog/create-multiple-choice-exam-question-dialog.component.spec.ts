import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMultipleChoiceExamQuestionDialogComponent } from './create-multiple-choice-exam-question-dialog.component';

describe('CreateMultipleChoiceExamQuestionDialogComponent', () => {
  let component: CreateMultipleChoiceExamQuestionDialogComponent;
  let fixture: ComponentFixture<CreateMultipleChoiceExamQuestionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateMultipleChoiceExamQuestionDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(
      CreateMultipleChoiceExamQuestionDialogComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
