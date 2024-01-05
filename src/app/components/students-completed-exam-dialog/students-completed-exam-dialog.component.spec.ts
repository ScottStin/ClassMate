import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsCompletedExamDialogComponent } from './students-completed-exam-dialog.component';

describe('StudentsCompletedExamDialogComponent', () => {
  let component: StudentsCompletedExamDialogComponent;
  let fixture: ComponentFixture<StudentsCompletedExamDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentsCompletedExamDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsCompletedExamDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
