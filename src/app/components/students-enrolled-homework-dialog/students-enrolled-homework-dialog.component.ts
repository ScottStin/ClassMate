import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { first, Observable } from 'rxjs';
import { HomeworkService } from 'src/app/services/homework-service/homework.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { HomeworkDTO } from 'src/app/shared/models/homework.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-students-enrolled-homework-dialog',
  templateUrl: './students-enrolled-homework-dialog.component.html',
  styleUrls: ['./students-enrolled-homework-dialog.component.css'],
})
export class StudentsEnrolledHomeworkDialogComponent implements OnInit {
  homeworkItem: HomeworkDTO;
  usersLoading: boolean;
  users$: Observable<UserDTO[]>;
  studentNames: StudentList[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { homeworkItem: HomeworkDTO },
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    private readonly homeworkService: HomeworkService,
    public dialog: MatDialog,
    private readonly dialogRef: MatDialogRef<StudentsEnrolledHomeworkDialogComponent>
  ) {
    this.homeworkItem = data.homeworkItem;
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.usersLoading = true;
    this.users$ = this.userService.users$;
    this.userService.getAll().subscribe({
      next: (res) => {
        for (const student of this.homeworkItem.students) {
          // --- get list of students enrolled in this hoemwork:
          let feedbackPending = false;
          const studentComments = this.homeworkItem.comments?.filter(
            (comment) => comment.studentId === student.studentId
          );
          if (studentComments && studentComments.length > 0) {
            const lastComment = studentComments[studentComments.length - 1];
            feedbackPending = lastComment.commentType === 'submission';
          }
          this.studentNames.push({
            name: res.find((obj) => obj._id === student.studentId)?.name,
            email: res.find((obj) => obj._id === student.studentId)?.email,
            id: student.studentId,
            feedbackPending,
            completed: this.homeworkItem.students.find(
              (obj) => obj.studentId === student.studentId
            )?.completed,
          });
        }

        // --- remove deleted students:
        this.studentNames = this.studentNames.filter(
          (student) =>
            ![undefined, null, ''].includes(student.name) &&
            ![undefined, null, ''].includes(student.email)
        );

        this.usersLoading = false;
      },
      error: (error: Error) => {
        const snackbar = this.snackbarService.openPermanent(
          'error',
          'Error: Failed to load users.',
          'retry'
        );
        // eslint-disable-next-line no-console
        console.log(error);
        snackbar
          .onAction()
          .pipe(first())
          .subscribe(() => {
            this.getUsers();
          });
      },
    });
  }

  studentsAwaitingFeedbackList(): StudentList[] {
    const awaiting = this.studentNames.filter((obj) => obj.feedbackPending);
    return awaiting;
  }

  studentsIncompleteList(): StudentList[] {
    const incomplete = this.studentNames.filter(
      (obj) => !(obj.completed ?? false)
    );
    return incomplete;
  }

  removeStudent(student: StudentList): void {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Remove ${
          student.name ?? 'student'
        } from this homework exercise?`,
        message: `Are you sure you want to remvoe this student? All submission attempts and feedback for this student will be permanently deleted.`,
        okLabel: `Remove`,
        cancelLabel: `Cancel`,
        routerLink: '',
      },
    });
    confirmDialogRef.afterClosed().subscribe((result: boolean) => {
      if (result && student.id !== undefined) {
        this.homeworkService
          .removeStudent({
            studentId: student.id,
            homeworkItemId: this.homeworkItem._id,
          })
          .subscribe({
            next: () => {
              this.snackbarService.open(
                'info',
                'Student sucessfully removed from homework item.'
              );

              // remove deleted student from list:
              this.studentNames = this.studentNames.filter(
                (obj) => obj.id !== student.id
              );
            },
            error: (error: Error) => {
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

export interface StudentList {
  name: string | undefined;
  email: string | undefined;
  id: string | undefined;
  feedbackPending?: boolean | undefined;
  completed?: boolean | undefined;
}
