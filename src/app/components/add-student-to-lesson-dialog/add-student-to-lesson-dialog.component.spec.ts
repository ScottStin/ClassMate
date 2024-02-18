import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStudentToLessonDialogComponent } from './add-student-to-lesson-dialog.component';

describe('AddStudentToLessonDialogComponent', () => {
  let component: AddStudentToLessonDialogComponent;
  let fixture: ComponentFixture<AddStudentToLessonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddStudentToLessonDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddStudentToLessonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
