import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFillBlanksExamQuestionDialogComponent } from './create-fill-blanks-exam-question-dialog.component';

describe('CreateFillBlanksExamQuestionDialogComponent', () => {
  let component: CreateFillBlanksExamQuestionDialogComponent;
  let fixture: ComponentFixture<CreateFillBlanksExamQuestionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateFillBlanksExamQuestionDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFillBlanksExamQuestionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
