import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateAiQuestionPromptComponent } from './generate-ai-question-prompt.component';

describe('GenerateAiQuestionPromptComponent', () => {
  let component: GenerateAiQuestionPromptComponent;
  let fixture: ComponentFixture<GenerateAiQuestionPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateAiQuestionPromptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateAiQuestionPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
