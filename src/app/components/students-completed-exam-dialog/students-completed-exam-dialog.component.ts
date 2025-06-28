import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@UntilDestroy()
@Component({
  selector: 'app-students-completed-exam-dialog',
  templateUrl: './students-completed-exam-dialog.component.html',
  styleUrls: ['./students-completed-exam-dialog.component.css'],
})
export class StudentsCompletedExamDialogComponent implements OnInit {
  exam: ExamDTO;
  usersLoading: boolean;
  users$: Observable<UserDTO[]>;

  studentsCompleted: ExamStudentList[] = [];
  studentsEnrolled: ExamStudentList[] = [];
  studentNamesAwaitingMark: ExamStudentList[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { exam: ExamDTO },
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    private readonly dialogRef: MatDialogRef<StudentsCompletedExamDialogComponent>
  ) {
    this.exam = data.exam;
  }

  ngOnInit(): void {
    this.getStudentList();
  }

  getStudentList(): void {
    this.usersLoading = true;
    this.users$ = this.userService.users$;
    this.userService.getAll().subscribe({
      next: (res) => {
        for (const student of this.exam.studentsCompleted) {
          const marked = student.mark;
          this.studentsCompleted.push({
            name: res.find((obj) => obj._id === student.studentId)?.name,
            studentId: res.find((obj) => obj._id === student.studentId)?._id,
            marked,
          });

          this.studentNamesAwaitingMark = this.studentsCompleted.filter(
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            (studentName) => !studentName.marked
          );
        }

        for (const student of this.exam.studentsEnrolled) {
          this.studentsEnrolled.push({
            name: res.find((obj) => obj._id === student)?.name,
            studentId: res.find((obj) => obj._id === student)?._id,
          });
        }

        this.usersLoading = false;
      },
      error: () => {
        this.snackbarService.queueBar('error', 'Error: Failed to load users.', {
          label: `retry`,
          registerAction: (onAction: Observable<void>) =>
            onAction.pipe(untilDestroyed(this)).subscribe(() => {
              this.getStudentList();
            }),
        });
      },
    });
  }

  markExam(student: ExamStudentList): void {
    this.dialogRef.close(student);
  }

  studentsAwaitingMarkCount(): number {
    const awaiaitng = this.studentsCompleted.filter(
      (obj) => obj.marked === null || obj.marked === undefined
    ).length;
    return awaiaitng;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

export class ExamStudentList {
  name: string | undefined;
  studentId: string | undefined;
  marked?: string | number | null;
}
