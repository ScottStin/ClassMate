import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { ExamService } from 'src/app/services/exam-service/exam.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { EnrollStudentDialogComponent } from '../enroll-student-dialog/enroll-student-dialog.component';

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
    @Inject(MAT_DIALOG_DATA)
    public data: StudentsCompletedExamDialogData,
    private readonly examService: ExamService,
    private readonly snackbarService: SnackbarService,
    private readonly notificationService: NotificationService,
    public dialog: MatDialog,
    private readonly dialogRef: MatDialogRef<StudentsCompletedExamDialogComponent>
  ) {
    this.exam = data.exam;
  }

  ngOnInit(): void {
    this.getStudentList();
  }

  getStudentList(): void {
    this.usersLoading = true;

    for (const student of this.exam.studentsCompleted) {
      const marked = student.mark;
      this.studentsCompleted.push({
        name: this.data.students.find((obj) => obj._id === student.studentId)
          ?.name,
        studentId: this.data.students.find(
          (obj) => obj._id === student.studentId
        )?._id,
        marked,
      });

      this.studentNamesAwaitingMark = this.studentsCompleted.filter(
        (studentName) => !studentName.marked
      );
    }

    for (const student of this.exam.studentsEnrolled) {
      this.studentsEnrolled.push({
        name: this.data.students.find((obj) => obj._id === student)?.name,
        studentId: this.data.students.find((obj) => obj._id === student)?._id,
      });
    }

    this.usersLoading = false;
  }

  markExam(student: ExamStudentList): void {
    this.dialogRef.close(student);
  }

  studentsAwaitingMarkCount(): number {
    const awaiting = this.studentsCompleted.filter(
      (obj) => obj.marked === null || obj.marked === undefined
    ).length;
    return awaiting;
  }

  openAddStudentsToExamDialog(): void {
    const addStudentToExamDialogRef = this.dialog.open(
      EnrollStudentDialogComponent,
      {
        data: {
          studentsPreviouslyEnrolledIds: this.exam.studentsEnrolled,
          studentsToDisplay: this.data.students,
          allStudents: this.data.students,
          pageName: 'Exam',
          disableRemove: true,
        },
      }
    );
    addStudentToExamDialogRef.afterClosed().subscribe((result?: UserDTO[]) => {
      if (result) {
        this.enrollStudentsInExam(result);
      }
    });
  }

  enrollStudentsInExam(students: UserDTO[]): void {
    let studentsToEnrolIds = students.map((student) => student._id);

    const studentsAlreadyEnrolledIds = this.exam.studentsEnrolled;

    studentsToEnrolIds = studentsToEnrolIds.filter(
      (studentToEnrolId) =>
        !studentsAlreadyEnrolledIds.includes(studentToEnrolId)
    );

    this.examService
      .enrolStudentsInExam({ ...this.data, studentIds: studentsToEnrolIds })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (exam) => {
          this.snackbarService.queueBar(
            'success',
            'Students successfully enrolled in exam.'
          );
          // this.loadPageData(); // replaced with socket

          this.notificationService
            .create({
              recipients: studentsToEnrolIds,
              message: `You have been enrolled in an exam.`,
              createdBy: this.exam.assignedTeacherId,
              dateSent: new Date().getTime(),
              seenBy: [],
              schoolId: this.exam.schoolId ?? '',
              link: 'exams',
            })
            .pipe(untilDestroyed(this))
            .subscribe();

          this.studentsCompleted = [];
          this.studentNamesAwaitingMark = [];
          this.studentsEnrolled = [];
          this.exam = exam;
          setTimeout(() => {
            this.getStudentList();
          }, 1);
        },
        error: (error: Error) => {
          this.snackbarService.queueBar('error', error.message);
        },
      });
  }

  resetStudentExam(student: ExamStudentList): void {
    if (!student.studentId) {
      this.snackbarService.queueBar(
        'error',
        'Student not found. Please try again'
      );

      return;
    }

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Reset exam for ${student.name ?? 'student'}?`,
        message: `This student's exam will be reset and all their answer's will be permanently deleted.`,
        okLabel: `Continue`,
        cancelLabel: `Cancel`,
        routerLink: '',
      },
    });
    confirmDialogRef.afterClosed().subscribe((result: boolean) => {
      if (result && student.studentId) {
        this.examService
          .resetStudentExam(this.exam._id, student.studentId)
          .pipe(untilDestroyed(this))
          .subscribe({
            next: () => {
              this.snackbarService.queueBar(
                'success',
                'Students exam successfully reset.'
              );

              if (student.studentId) {
                this.notificationService
                  .create({
                    recipients: [student.studentId],
                    message: `Your exam has been reset. You can now attempt this exam again.`,
                    createdBy: this.exam.assignedTeacherId,
                    dateSent: new Date().getTime(),
                    seenBy: [],
                    schoolId: this.exam.schoolId ?? '',
                    link: 'exams',
                  })
                  .pipe(untilDestroyed(this))
                  .subscribe();
              }

              this.closeDialog();
            },
            error: (error: Error) => {
              this.snackbarService.queueBar('error', error.message);
            },
          });
      }
    });
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

export class StudentsCompletedExamDialogData {
  students: UserDTO[];
  exam: ExamDTO;
}
