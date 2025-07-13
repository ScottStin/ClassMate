import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { MultiChoiceQuestionComponent } from './multi-choice-question.component';

describe('MultiChoiceQuestionComponent', () => {
  let component: MultiChoiceQuestionComponent;
  let fixture: ComponentFixture<MultiChoiceQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultiChoiceQuestionComponent],
      imports: [MatIconModule, MatListModule, MatCheckboxModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiChoiceQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
