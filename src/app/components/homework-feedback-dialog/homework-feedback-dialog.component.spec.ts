import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeworkFeedbackDialogComponent } from './homework-feedback-dialog.component';

describe('HomeworkFeedbackDialogComponent', () => {
  let component: HomeworkFeedbackDialogComponent;
  let fixture: ComponentFixture<HomeworkFeedbackDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeworkFeedbackDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeworkFeedbackDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
