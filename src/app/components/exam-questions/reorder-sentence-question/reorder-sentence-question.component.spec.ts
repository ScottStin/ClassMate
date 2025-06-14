import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReorderSentenceQuestionComponent } from './reorder-sentence-question.component';

describe('ReorderSentenceQuestionComponent', () => {
  let component: ReorderSentenceQuestionComponent;
  let fixture: ComponentFixture<ReorderSentenceQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReorderSentenceQuestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReorderSentenceQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
