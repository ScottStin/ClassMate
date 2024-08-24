import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { first, Observable } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { HomeworkDTO } from 'src/app/shared/models/homework.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-students-incomplete-homework-dialog',
  templateUrl: './students-incomplete-homework-dialog.component.html',
  styleUrls: ['./students-incomplete-homework-dialog.component.css'],
})
export class StudentsIncompleteHomeworkDialogComponent implements OnInit {
  homeworkItem: HomeworkDTO;
  usersLoading: boolean;
  users$: Observable<UserDTO[]>;
  studentNames: StudentList[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { homeworkItem: HomeworkDTO },
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    private readonly dialogRef: MatDialogRef<StudentsIncompleteHomeworkDialogComponent>
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
            (comment) => comment.student === student.studentId
          );
          if (studentComments && studentComments.length > 0) {
            const lastComment = studentComments[studentComments.length - 1];
            feedbackPending = lastComment.commentType === 'submission';
          }
          this.studentNames.push({
            name: res.find((obj) => obj._id === student.studentId)?.name,
            email: res.find((obj) => obj._id === student.studentId)?.email,
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

  closeDialog(): void {
    this.dialogRef.close();
  }
}

export interface StudentList {
  name: string | undefined;
  email: string | undefined;
  feedbackPending?: boolean | undefined;
  completed?: boolean | undefined;
}
