import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioResponseQuestionComponent } from './audio-response-question.component';

describe('AudioResponseQuestionComponent', () => {
  let component: AudioResponseQuestionComponent;
  let fixture: ComponentFixture<AudioResponseQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioResponseQuestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioResponseQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
