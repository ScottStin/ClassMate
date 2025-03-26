import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { first, Observable } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-students-completed-exam-dialog',
  templateUrl: './students-completed-exam-dialog.component.html',
  styleUrls: ['./students-completed-exam-dialog.component.css'],
})
export class StudentsCompletedExamDialogComponent implements OnInit {
  exam: ExamDTO;
  usersLoading: boolean;
  users$: Observable<UserDTO[]>;

  studentNames: {
    name: string | undefined;
    studentId: string | undefined;
    marked?: string | number | null;
  }[] = [];

  studentNamesAwaitingMark: {
    name: string | undefined;
    studentId: string | undefined;
    marked?: string | number | null;
  }[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { exam: ExamDTO },
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    private readonly dialogRef: MatDialogRef<StudentsCompletedExamDialogComponent>
  ) {
    this.exam = data.exam;
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.usersLoading = true;
    this.users$ = this.userService.users$;
    this.userService.getAll().subscribe({
      next: (res) => {
        for (const student of this.exam.studentsCompleted) {
          const marked = student.mark;
          this.studentNames.push({
            name: res.find((obj) => obj._id === student.studentId)?.name,
            studentId: res.find((obj) => obj._id === student.studentId)?._id,
            marked,
          });

          this.studentNamesAwaitingMark = this.studentNames.filter(
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            (studentName) => !studentName.marked
          );
        }
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

  markExam(student: {
    name: string | undefined;
    studentId: string | undefined;
    marked?: string | number | null;
  }): void {
    this.dialogRef.close(student);
  }

  studentsAwaitingMarkCount(): number {
    const awaiaitng = this.studentNames.filter(
      (obj) => obj.marked === null || obj.marked === undefined
    ).length;
    return awaiaitng;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
