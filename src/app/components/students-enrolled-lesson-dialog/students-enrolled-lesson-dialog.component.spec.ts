import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsEnrolledLessonDialogComponent } from './students-enrolled-lesson-dialog.component';

describe('StudentsEnrolledLessonDialogComponent', () => {
  let component: StudentsEnrolledLessonDialogComponent;
  let fixture: ComponentFixture<StudentsEnrolledLessonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentsEnrolledLessonDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentsEnrolledLessonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
