import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsEnrolledHomeworkDialogComponent } from './students-enrolled-homework-dialog.component';

describe('StudentsEnrolledHomeworkDialogComponent', () => {
  let component: StudentsEnrolledHomeworkDialogComponent;
  let fixture: ComponentFixture<StudentsEnrolledHomeworkDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentsEnrolledHomeworkDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsEnrolledHomeworkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
