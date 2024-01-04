import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrittenResponseQuestionComponent } from './written-response-question.component';

describe('WrittenResponseQuestionComponent', () => {
  let component: WrittenResponseQuestionComponent;
  let fixture: ComponentFixture<WrittenResponseQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WrittenResponseQuestionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WrittenResponseQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
