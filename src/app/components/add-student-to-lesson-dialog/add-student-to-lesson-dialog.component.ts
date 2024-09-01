import {
  Component,
  Inject,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { LessonDTO } from 'src/app/shared/models/lesson.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { StudentsEnrolledLessonDialogComponent } from '../students-enrolled-lesson-dialog/students-enrolled-lesson-dialog.component';

@Component({
  selector: 'app-add-student-to-lesson-dialog',
  templateUrl: './add-student-to-lesson-dialog.component.html',
  styleUrls: ['./add-student-to-lesson-dialog.component.css'],
})
export class AddStudentToLessonDialogComponent implements OnInit {
  @ViewChildren('checkboxRef') checkboxRefs: QueryList<MatCheckbox>;
  error: Error;
  lesson?: LessonDTO;
  enrolledStudents: UserDTO[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      lesson: LessonDTO;
      filteredStudents: UserDTO[];
      users: UserDTO[];
    },
    private readonly snackbarService: SnackbarService,
    private readonly dialogRef: MatDialogRef<StudentsEnrolledLessonDialogComponent>,
    public dialog: MatDialog
  ) {
    this.lesson = data.lesson;
  }

  ngOnInit(): void {
    for (const studentEmail of this.lesson?.studentsEnrolled ?? []) {
      const foundUser = this.data.users.find(
        (obj) => obj.email === studentEmail
      );
      if (foundUser) {
        this.enrolledStudents.push(foundUser);
      }
    }
  }

  getLevelList(): string {
    if (this.lesson) {
      return this.lesson.level.map((obj) => obj.shortName).join(', ');
    } else {
      return '';
    }
  }

  enrolStudent(checked: boolean, index: number, student: UserDTO): void {
    const checkbox = this.checkboxRefs.toArray()[index];
    if (
      !checked &&
      this.lesson &&
      this.lesson.studentsEnrolled.includes(student.email)
    ) {
      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: `Remove ${student.name} from this lesson?`,
          message: `This student is already enrolled in this lesson. Are you sure you want to remove them? Their seat will become available and they will be notified of the change.`,
          okLabel: `Remove`,
          cancelLabel: `Cancel`,
          routerLink: '',
        },
      });
      confirmDialogRef.afterClosed().subscribe((result: boolean) => {
        if (!result) {
          checkbox.checked = true;
        }
      });
    }
    if (checkbox.checked && !this.enrolledStudents.includes(student)) {
      this.enrolledStudents.push(student);
    }
    if (!checkbox.checked && this.enrolledStudents.includes(student)) {
      const i = this.enrolledStudents.indexOf(student);
      this.enrolledStudents.splice(i, 1);
    }
    if (
      this.lesson &&
      this.enrolledStudents.length >= this.lesson.maxStudents
    ) {
      this.snackbarService.open(
        'warn',
        'Lesson is now full. Remove a student by unchecking them before you can add more students'
      );
    }
  }

  closeDialog(result: boolean | null | UserDTO[]): void {
    this.dialogRef.close(result);
  }
}
