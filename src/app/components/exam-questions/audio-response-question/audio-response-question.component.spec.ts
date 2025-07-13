import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AudioResponseQuestionComponent } from './audio-response-question.component';

describe('AudioResponseQuestionComponent', () => {
  let component: AudioResponseQuestionComponent;
  let fixture: ComponentFixture<AudioResponseQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioResponseQuestionComponent],
      imports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressBarModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AudioResponseQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
