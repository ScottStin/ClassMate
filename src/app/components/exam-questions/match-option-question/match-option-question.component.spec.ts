import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchOptionQuestionComponent } from './match-option-question.component';

describe('MatchOptionQuestionComponent', () => {
  let component: MatchOptionQuestionComponent;
  let fixture: ComponentFixture<MatchOptionQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatchOptionQuestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchOptionQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
