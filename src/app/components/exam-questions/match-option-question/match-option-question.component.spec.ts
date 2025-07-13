import { DragDropModule } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';

import { MatchOptionQuestionComponent } from './match-option-question.component';

describe('MatchOptionQuestionComponent', () => {
  let component: MatchOptionQuestionComponent;
  let fixture: ComponentFixture<MatchOptionQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MatchOptionQuestionComponent],
      imports: [DragDropModule, MatIconModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchOptionQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
