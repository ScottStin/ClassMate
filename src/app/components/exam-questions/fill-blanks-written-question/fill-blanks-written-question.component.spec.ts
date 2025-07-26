import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FillBlanksWrittenQuestionComponent } from './fill-blanks-written-question.component';

describe('FillBlanksWrittenQuestionComponent', () => {
  let component: FillBlanksWrittenQuestionComponent;
  let fixture: ComponentFixture<FillBlanksWrittenQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FillBlanksWrittenQuestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FillBlanksWrittenQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
