import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewExamQuestionComponent } from './preview-exam-question.component';

describe('PreviewExamQuestionComponent', () => {
  let component: PreviewExamQuestionComponent;
  let fixture: ComponentFixture<PreviewExamQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewExamQuestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewExamQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
