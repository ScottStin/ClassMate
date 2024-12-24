import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReorderSentenceExamQuestionDialogComponent } from './create-reorder-sentence-exam-question-dialog.component';

describe('CreateReorderSentenceExamQuestionDialogComponent', () => {
  let component: CreateReorderSentenceExamQuestionDialogComponent;
  let fixture: ComponentFixture<CreateReorderSentenceExamQuestionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateReorderSentenceExamQuestionDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateReorderSentenceExamQuestionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
