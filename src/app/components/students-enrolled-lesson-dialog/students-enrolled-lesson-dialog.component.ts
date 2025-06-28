import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { LessonService } from 'src/app/services/lesson-service/lesson.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { LessonDTO } from 'src/app/shared/models/lesson.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { AddStudentToLessonDialogComponent } from '../add-student-to-lesson-dialog/add-student-to-lesson-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-students-enrolled-lesson-dialog',
  templateUrl: './students-enrolled-lesson-dialog.component.html',
  styleUrls: ['./students-enrolled-lesson-dialog.component.css'],
})
export class StudentsEnrolledLessonDialogComponent implements OnInit {
  error: Error;
  lesson?: LessonDTO;
  usersLoading: boolean;
  studentNames: {
    name: string | undefined;
    email: string | undefined;
    _id: string | undefined;
  }[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { lesson: LessonDTO; pastLesson?: boolean; users: UserDTO[] },
    private readonly lessonService: LessonService,
    private readonly notificationService: NotificationService,
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
    for (const student of this.lesson?.studentsEnrolledIds ?? []) {
      this.studentNames.push({
        name: this.data.users.find((obj) => obj._id === student)?.name,
        email: this.data.users.find((obj) => obj._id === student)?.email,
        _id: this.data.users.find((obj) => obj._id === student)?._id,
      });
    }
  }

  removeStudent(student: {
    name: string | undefined;
    email: string | undefined;
    _id: string | undefined;
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
        const user = this.data.users.find((obj) => obj._id === student._id);
        if (user && this.lesson) {
          this.lessonService.cancelLesson(this.lesson, user).subscribe({
            next: () => {
              this.snackbarService.queueBar(
                'info',
                'Student has been removed from lesson and notified.'
              );
              this.dialogRef.close(true);

              const lessonTeacher = this.data.users.find(
                (teacher) => teacher._id === this.lesson?.teacherId
              );

              // --- create notificaiton:
              this.notificationService
                .create({
                  recipients: [student._id ?? ''],
                  message: `You have been removed from ${
                    lessonTeacher?.name ?? 'your school'
                  }'s lesson.`, // '${this.lesson?.name ?? ''}'`,
                  createdBy: this.lesson?.teacherId ?? '',
                  dateSent: new Date().getTime(),
                  seenBy: [],
                  schoolId: this.lesson?.schoolId ?? '',
                })
                .pipe(untilDestroyed(this))
                .subscribe();
            },
            error: (error: Error) => {
              this.error = error;
              this.snackbarService.queueBar('error', error.message);
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
        if (result && this.lesson) {
          this.lessonService
            .joinLessonMultipleStudents(this.lesson, result)
            .subscribe({
              next: () => {
                this.snackbarService.queueBar(
                  'info',
                  'Students have been added to this lesson and notified.' // todo: this should include 'removed' if some students were removed from the lesson as well.
                );
                this.dialogRef.close(true);

                // Get list of student IDs that were removed from this lesson
                const removedStudentIds =
                  this.lesson?.studentsEnrolledIds.filter(
                    (id) => !result.some((student) => student._id === id)
                  );

                // Notify students that they were removed from the class:
                if (
                  removedStudentIds?.length !== undefined &&
                  removedStudentIds.length > 0
                ) {
                  const lessonTeacher = this.data.users.find(
                    (teacher) => teacher._id === this.lesson?.teacherId
                  );

                  // --- create notificaiton:
                  this.notificationService
                    .create({
                      recipients: removedStudentIds,
                      message: `You have been removed from ${
                        lessonTeacher?.name ?? 'your school'
                      }'s lesson.`, // '${this.lesson?.name ?? ''}'`,
                      createdBy: this.lesson?.teacherId ?? '',
                      dateSent: new Date().getTime(),
                      seenBy: [],
                      schoolId: this.lesson?.schoolId ?? '',
                    })
                    .pipe(untilDestroyed(this))
                    .subscribe();
                }

                // Get list of student IDs that were added to this lesson
                const addedStudentIds = result
                  .filter(
                    (student) =>
                      !(
                        this.lesson?.studentsEnrolledIds.includes(
                          student._id
                        ) ?? false
                      )
                  )
                  .map((student) => student._id);

                // Notify students that they were removed from the class:
                if (addedStudentIds.length > 0) {
                  const lessonTeacher = this.data.users.find(
                    (teacher) => teacher._id === this.lesson?.teacherId
                  );

                  // --- create notificaiton:
                  this.notificationService
                    .create({
                      recipients: addedStudentIds,
                      message: `You have been added to ${
                        lessonTeacher?.name ?? 'your school'
                      }'s lesson.`, // '${this.lesson?.name ?? ''}'`,
                      createdBy: this.lesson?.teacherId ?? '',
                      dateSent: new Date().getTime(),
                      seenBy: [],
                      schoolId: this.lesson?.schoolId ?? '',
                    })
                    .pipe(untilDestroyed(this))
                    .subscribe();
                }
              },
              error: (error: Error) => {
                this.error = error;
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
