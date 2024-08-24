import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsIncompleteHomeworkDialogComponent } from './students-incomplete-homework-dialog.component';

describe('StudentsIncompleteHomeworkDialogComponent', () => {
  let component: StudentsIncompleteHomeworkDialogComponent;
  let fixture: ComponentFixture<StudentsIncompleteHomeworkDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentsIncompleteHomeworkDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentsIncompleteHomeworkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
