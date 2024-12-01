import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  combineLatest,
  finalize,
  first,
  forkJoin,
  Observable,
  of,
  tap,
} from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { CreateHomeworkDialogComponent } from 'src/app/components/create-homework-dialog/create-homework-dialog.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { HomeworkService } from 'src/app/services/homework-service/homework.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { getUserFromObservable } from 'src/app/shared/helpers/user.helper';
import { CommentDTO, HomeworkDTO } from 'src/app/shared/models/homework.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { HomeworkCardComponent } from './homework-card/homework-card.component';
import { HomeworkTableComponent } from './homework-table/homework-table.component';

@UntilDestroy()
@Component({
  selector: 'app-homework-page',
  templateUrl: './homework-page.component.html',
  styleUrls: ['./homework-page.component.css'],
})
export class HomeworkPageComponent implements OnInit {
  @ViewChild(HomeworkTableComponent)
  homeworkTableComponent: HomeworkTableComponent | undefined;

  @ViewChild(HomeworkCardComponent)
  homeworkCardComponent: HomeworkCardComponent;

  selectedStudent: UserDTO | null;
  isStudentSelectOpen = false;

  // --- data:
  users$: Observable<UserDTO[]>;
  teachers$: Observable<UserDTO[]>;
  students$: Observable<UserDTO[]>;
  homework$: Observable<HomeworkDTO[] | null>;
  currentSchool$: Observable<SchoolDTO | null>;
  currentUser$: Observable<UserDTO | null>;
  homeworkPageLoading = true;

  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly userService: UserService,
    public readonly authStoreService: AuthStoreService,
    public readonly schoolService: SchoolService,
    public readonly homeworkService: HomeworkService,
    public readonly notificationService: NotificationService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.homework$ = this.homeworkService.homework$;
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.currentUser$ = this.authStoreService.currentUser$;
    this.loadPageData();
  }

  loadPageData(): void {
    this.homeworkPageLoading = true;
    this.currentSchool$
      .pipe(untilDestroyed(this))
      .subscribe((currentSchool) => {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain, @typescript-eslint/strict-boolean-expressions
        if (currentSchool && currentSchool._id) {
          forkJoin([
            this.userService.getAllBySchoolId(currentSchool._id),
            this.homeworkService.getAllBySchoolId(currentSchool._id),
          ])
            .pipe(untilDestroyed(this))
            .pipe(
              first(),
              tap(() => {
                this.currentUser$.pipe(untilDestroyed(this)).subscribe();
              }),
              finalize(() => {
                this.homeworkPageLoading = false;
              })
            )
            .subscribe({
              next: ([users]) => {
                const teachers = users.filter(
                  (user) => user.userType.toLowerCase() === 'teacher'
                );
                const students = users.filter(
                  (user) => user.userType.toLowerCase() === 'student'
                );
                this.teachers$ = of(teachers);
                this.students$ = of(students);
              },
              error: (error: Error) => {
                const snackbar = this.snackbarService.openPermanent(
                  'error',
                  `Error: Failed to load page: ${error.message}`,
                  'retry'
                );
                snackbar
                  .onAction()
                  .pipe(first())
                  .subscribe(() => {
                    this.loadPageData();
                  });
              },
            });
        }
      });
  }

  createHomework(): void {
    combineLatest([this.teachers$, this.students$, this.currentSchool$])
      .pipe(first())
      .subscribe(([teachers, students, currentSchool]) => {
        const dialogRef = this.dialog.open(CreateHomeworkDialogComponent, {
          data: {
            title: 'Create New Homework Assignment',
            teachers,
            students,
            currentSchool,
          },
        });
        dialogRef.afterClosed().subscribe((result: HomeworkDTO | null) => {
          if (
            result &&
            currentSchool?._id !== null &&
            currentSchool?._id !== undefined
          ) {
            this.homeworkService
              .create({ ...result, schoolId: currentSchool._id })
              .subscribe({
                next: () => {
                  this.snackbarService.open(
                    'info',
                    'Homework exercise successfully created. Assigned students have been notified.'
                  );
                  this.loadPageData();

                  // --- create notificaiton:
                  getUserFromObservable(this.users$, result.assignedTeacherId)
                    .then((teacher) => {
                      if (teacher) {
                        this.notificationService
                          .create({
                            recipients: result.students.map(
                              (student) => student.studentId
                            ),
                            message: `You have been given new homework by ${teacher.name}.`,
                            createdBy: result.assignedTeacherId,
                            dateSent: new Date().getTime(),
                            seenBy: [],
                            schoolId: result.schoolId,
                            link: 'homework',
                          })
                          .pipe(untilDestroyed(this))
                          .subscribe();
                      }
                    })
                    .catch((error) => {
                      // eslint-disable-next-line no-console
                      console.error(
                        'Error getting teacher for notification:',
                        error
                      );
                    });
                },
                error: (error: Error) => {
                  this.snackbarService.openPermanent('error', error.message);
                },
              });
          }
        });
      });
  }

  openEditHomeworkDialog(homework: HomeworkDTO): void {
    combineLatest([this.teachers$, this.students$, this.currentSchool$])
      .pipe(first())
      .subscribe(([teachers, students, currentSchool]) => {
        const dialogRef = this.dialog.open(CreateHomeworkDialogComponent, {
          data: {
            title: 'Modify Homework Assignment',
            teachers,
            students,
            currentSchool,
            body: homework,
          },
        });
        dialogRef.afterClosed().subscribe((result: HomeworkDTO | null) => {
          if (
            result &&
            currentSchool?._id !== null &&
            currentSchool?._id !== undefined
          ) {
            this.homeworkService
              .update({ ...result, schoolId: currentSchool._id })
              .subscribe({
                next: () => {
                  this.snackbarService.open(
                    'info',
                    'Homework exercise successfully modified. Assigned students have been notified.'
                  );
                  this.loadPageData();
                },
                error: (error: Error) => {
                  this.snackbarService.openPermanent('error', error.message);
                },
              });
          }
        });
      });
  }

  openConfirmDeleteDialog(homework: HomeworkDTO): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Delete homework?`,
        message: `Are you sure you want to permanently delete this homework exercise? All users currently assigned to this homework exercise will lose access. All attachments and feedback will also be deleted.`,
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });
    dialogRef.afterClosed().subscribe((result: UserDTO[] | undefined) => {
      if (result) {
        this.homeworkService.delete(homework).subscribe({
          next: () => {
            this.snackbarService.open('info', 'Homework successfully deleted');
            this.loadPageData();
          },
          error: (error: Error) => {
            this.snackbarService.openPermanent('error', error.message);
          },
        });
      }
    });
  }

  changeStudent(value: UserDTO): void {
    this.selectedStudent = value;
  }

  filterResults(text: string): void {
    if (this.homeworkTableComponent) {
      this.homeworkTableComponent.filterResults(text);
    }
    this.homeworkCardComponent.filterResults(text);
  }

  saveFeedback(feedback: {
    feedback: CommentDTO;
    homeworkId: string;
    update: boolean | undefined;
    schoolId: string;
  }): void {
    let message = `Feedback successfully ${
      feedback.update === true ? 'edited' : 'added to homework'
    }. The student has been notified of your feedback.`;

    if (feedback.feedback.commentType === 'submission') {
      message = `Thank you for ${
        feedback.update === true ? 'editing' : 'submitting'
      } your homework. Your teacher has been notified and will provide you with feedback shortly.`;
    }

    if (feedback.update !== true) {
      this.homeworkService.addComment(feedback).subscribe({
        next: () => {
          this.snackbarService.open('info', message);
          this.loadPageData();

          // --- create notificaiton:
          getUserFromObservable(
            this.users$,
            (feedback.feedback.commentType === 'feedback'
              ? feedback.feedback.teacherId
              : feedback.feedback.studentId) ?? ''
          )
            .then((user) => {
              if (user) {
                this.notificationService
                  .create({
                    recipients:
                      feedback.feedback.commentType === 'feedback'
                        ? [feedback.feedback.studentId]
                        : [feedback.feedback.teacherId ?? ''],
                    message:
                      feedback.feedback.commentType === 'feedback'
                        ? `You have received new feedback on your homework` // from ${user.name}`
                        : `A student has submitted homework and requires feedback.`,
                    createdBy:
                      (feedback.feedback.commentType === 'feedback'
                        ? feedback.feedback.teacherId
                        : feedback.feedback.studentId) ?? '',
                    dateSent: new Date().getTime(),
                    seenBy: [],
                    schoolId: feedback.schoolId,
                    link: 'homework',
                  })
                  .pipe(untilDestroyed(this))
                  .subscribe();
              }
            })
            .catch((error) => {
              // eslint-disable-next-line no-console
              console.error('Error creating notification:', error);
            });
        },
        error: (error: Error) => {
          this.snackbarService.openPermanent('error', error.message);
        },
      });
    } else {
      this.homeworkService.editComment(feedback).subscribe({
        next: () => {
          this.snackbarService.open('info', message);
          this.loadPageData();
        },
        error: (error: Error) => {
          this.snackbarService.openPermanent('error', error.message);
        },
      });
    }
  }

  openDeleteCommentDialog(data: {
    homework: HomeworkDTO;
    comment: CommentDTO;
  }): void {
    const commentType = data.comment.commentType;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Delete ${commentType}?`,
        message: `Are you sure you want to permanently delete this ${commentType}? All attachments will also be deleted.`,
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });
    dialogRef.afterClosed().subscribe((result: UserDTO[] | undefined) => {
      if (result && data.homework._id) {
        this.homeworkService
          .deleteComment({
            feedback: data.comment,
            homeworkId: data.homework._id,
          })
          .subscribe({
            next: () => {
              this.snackbarService.open(
                'info',
                `Homework ${commentType} successfully deleted`
              );
              this.loadPageData();
            },
            error: (error: Error) => {
              this.snackbarService.openPermanent('error', error.message);
            },
          });
      }
    });
  }

  unfinishedStudentHomeworkCounter(
    studentId: string | null | undefined,
    homeworkItems: HomeworkDTO[] | null
  ): number {
    let unfinishedHomework = 0;
    if (homeworkItems && studentId !== null && studentId !== undefined) {
      const filteredHomeworkItems = homeworkItems.filter((homeworkItem) =>
        homeworkItem.students.some(
          (student) => student.studentId === studentId && !student.completed
        )
      );
      unfinishedHomework = filteredHomeworkItems.length;
    }
    return unfinishedHomework;
  }

  overdueStudentHomeworkCounter(
    studentId: string | null | undefined,
    homeworkItems: HomeworkDTO[] | null
  ): number {
    let unfinishedHomework = 0;
    if (homeworkItems && studentId !== null && studentId !== undefined) {
      const filteredHomeworkItems = homeworkItems.filter(
        (homeworkItem) =>
          homeworkItem.students.some(
            (student) => student.studentId === studentId && !student.completed
          ) &&
          homeworkItem.dueDate !== null &&
          new Date(homeworkItem.dueDate).getTime() < new Date().getTime() // todo - replace with isOverdue helper
      );
      unfinishedHomework = filteredHomeworkItems.length;
    }
    return unfinishedHomework;
  }

  markPendingHomeworkCounter(
    studentId: string | null | undefined,
    homeworkItems: HomeworkDTO[] | null
  ): number {
    let unfinishedHomework = 0;
    if (homeworkItems && studentId !== null && studentId !== undefined) {
      const filteredHomeworkItems = homeworkItems.filter((homeworkItem) =>
        homeworkItem.students.some(
          (student) => student.studentId === studentId && !student.completed
        )
      );
      if (filteredHomeworkItems.length > 0) {
        for (const filteredHomeworkItem of filteredHomeworkItems) {
          const studentComments = filteredHomeworkItem.comments?.filter(
            (comment) => comment.studentId === studentId
          );
          const commentLength = studentComments?.length;
          if (
            studentComments &&
            studentComments.length > 0 &&
            commentLength !== undefined &&
            studentComments[commentLength - 1].commentType === 'submission'
          ) {
            unfinishedHomework = unfinishedHomework + 1;
          }
        }
      }
    }
    return unfinishedHomework;
  }
}
