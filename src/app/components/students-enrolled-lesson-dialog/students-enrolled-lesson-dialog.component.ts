import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { LessonService } from 'src/app/services/lesson-service/lesson.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { LessonDTO } from 'src/app/shared/models/lesson.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { AddStudentToLessonDialogComponent } from '../add-student-to-lesson-dialog/add-student-to-lesson-dialog.component';

@Component({
  selector: 'app-students-enrolled-lesson-dialog',
  templateUrl: './students-enrolled-lesson-dialog.component.html',
  styleUrls: ['./students-enrolled-lesson-dialog.component.css'],
})
export class StudentsEnrolledLessonDialogComponent implements OnInit {
  error: Error;
  lesson: LessonDTO;
  usersLoading: boolean;
  studentNames: {
    name: string | undefined;
    email: string | undefined;
  }[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { lesson: LessonDTO; pastLesson?: boolean; users: UserDTO[] },
    private readonly userService: UserService,
    private readonly lessonService: LessonService,
    private readonly snackbarService: SnackbarService,
    private readonly dialogRef: MatDialogRef<StudentsEnrolledLessonDialogComponent>,
    public dialog: MatDialog
  ) {
    this.lesson = data.lesson;
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    for (const student of this.lesson.studentsEnrolled) {
      this.studentNames.push({
        name: this.data.users.find((obj) => obj.email === student)?.name,
        email: this.data.users.find((obj) => obj.email === student)?.email,
      });
    }
  }

  removeStudent(student: {
    name: string | undefined;
    email: string | undefined;
  }): void {
    const title = student.name !== undefined ? student.name : 'student';
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Remove ${title} from this lesson?`,
        message: `Are you sure you want to remove this student from the lesson? Their seat will become available and they will be notified of the change.`,
        okLabel: `Remove`,
        cancelLabel: `Cancel`,
        routerLink: '',
      },
    });
    confirmDialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        const user = this.data.users.find((obj) => obj.email === student.email);
        if (user) {
          this.lessonService.cancelLesson(this.lesson, user).subscribe({
            next: () => {
              this.snackbarService.open(
                'info',
                'Student has been removed from lesson and notified.'
              );
              this.dialogRef.close(true);
            },
            error: (error: Error) => {
              this.error = error;
              this.snackbarService.openPermanent('error', error.message);
            },
          });
        }
      }
    });
  }

  addStudentsToLessonDialog(lesson: LessonDTO): void {
    const filteredStudents = this.data.users.filter((obj) => {
      if (obj.level) {
        return lesson.level
          .map((level) => level.shortName)
          .includes(obj.level.shortName);
      } else {
        return false;
      }
    });
    const addStudentToLessonDialogRef = this.dialog.open(
      AddStudentToLessonDialogComponent,
      {
        data: { lesson, filteredStudents, users: this.data.users },
      }
    );
    addStudentToLessonDialogRef
      .afterClosed()
      .subscribe((result: UserDTO[] | null) => {
        if (result) {
          this.lessonService
            .joinLessonMultipleStudents(this.lesson, result)
            .subscribe({
              next: () => {
                this.snackbarService.open(
                  'info',
                  'Students have been added to this lesson and notified.' // todo: this should include 'removed' if some students were removed from the lesson as well.
                );
                this.dialogRef.close(true);
              },
              error: (error: Error) => {
                this.error = error;
                this.snackbarService.openPermanent('error', error.message);
              },
            });
        }
      });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
