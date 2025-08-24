import { Component, Inject, QueryList, ViewChildren } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserDTO } from 'src/app/shared/models/user.model';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { StudentsEnrolledLessonDialogComponent } from '../students-enrolled-lesson-dialog/students-enrolled-lesson-dialog.component';

@Component({
  selector: 'app-enroll-student-dialog',
  templateUrl: './enroll-student-dialog.component.html',
  styleUrls: ['./enroll-student-dialog.component.css'],
})
export class EnrollStudentDialogComponent {
  @ViewChildren('checkboxRef') checkboxRefs: QueryList<MatCheckbox>;
  error: Error;
  studentsEnrolledToEnrolIds: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      studentsPreviouslyEnrolledIds: string[];
      pageName: string;
      maxStudentsAllowed?: number;
      studentsToDisplay?: UserDTO[];
      allStudents: UserDTO[];
      levelList?: string;
      disableRemove?: boolean;
    },
    private readonly snackbarService: SnackbarService,
    private readonly dialogRef: MatDialogRef<StudentsEnrolledLessonDialogComponent>,
    public dialog: MatDialog
  ) {
    this.studentsEnrolledToEnrolIds = [...data.studentsPreviouslyEnrolledIds];
  }

  enrolStudent(
    checked: boolean,
    index: number,
    studentSelected: UserDTO
  ): void {
    const checkbox = this.checkboxRefs.toArray()[index];

    if (
      !checked &&
      this.data.studentsPreviouslyEnrolledIds.includes(studentSelected._id)
    ) {
      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: `Remove ${studentSelected.name} from this ${this.data.pageName}?`,
          message: `This student is already enrolled in this ${this.data.pageName}. Are you sure you want to remove them? They will be notified of the change.`,
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

    if (
      checkbox.checked &&
      !this.studentsEnrolledToEnrolIds.includes(studentSelected._id)
    ) {
      this.studentsEnrolledToEnrolIds.push(studentSelected._id);
    }

    if (
      !checkbox.checked &&
      this.studentsEnrolledToEnrolIds.includes(studentSelected._id)
    ) {
      this.studentsEnrolledToEnrolIds = this.studentsEnrolledToEnrolIds.filter(
        (studentEnrolled) => studentEnrolled !== studentSelected._id
      );
    }
    if (
      this.data.maxStudentsAllowed &&
      this.studentsEnrolledToEnrolIds.length >= this.data.maxStudentsAllowed
    ) {
      this.snackbarService.queueBar(
        'warn',
        `${this.data.pageName} is now full. Remove a student by unchecking them before you can add more students.`
      );
    }
  }

  isCheckboxDisabled(student: UserDTO): boolean {
    // disable checkbox if student has reached max:
    if (
      this.data.maxStudentsAllowed !== undefined &&
      this.studentsEnrolledToEnrolIds.length >= this.data.maxStudentsAllowed &&
      !this.studentsEnrolledToEnrolIds.includes(student._id) // allow unchecking of students already enrolled
    ) {
      return true;
    }

    if (!this.data.disableRemove) {
      return false;
    }
    return this.data.studentsPreviouslyEnrolledIds.includes(student._id); // disable unchecking of previously enrolled students
  }

  closeDialogAndSave(): void {
    const studentsEnrolled = [];

    for (const studentId of this.studentsEnrolledToEnrolIds) {
      const foundUser = this.data.allStudents.find(
        (user) => user._id === studentId
      );
      if (foundUser) {
        studentsEnrolled.push(foundUser);
      }
    }
    this.dialogRef.close(studentsEnrolled);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
