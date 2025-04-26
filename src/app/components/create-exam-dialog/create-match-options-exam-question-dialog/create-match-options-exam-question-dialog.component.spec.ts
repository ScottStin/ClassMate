import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchOptionsExamQuestionDialogComponent } from './create-match-options-exam-question-dialog.component';

describe('MatchOptionsExamQuestionDialogComponent', () => {
  let component: MatchOptionsExamQuestionDialogComponent;
  let fixture: ComponentFixture<MatchOptionsExamQuestionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatchOptionsExamQuestionDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchOptionsExamQuestionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
