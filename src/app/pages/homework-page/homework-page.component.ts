import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  combineLatest,
  finalize,
  first,
  forkJoin,
  map,
  Observable,
  of,
  Subscription,
  tap,
} from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { CreateHomeworkDialogComponent } from 'src/app/components/create-homework-dialog/create-homework-dialog.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { HomeworkService } from 'src/app/services/homework-service/homework.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { CommentDTO, HomeworkDTO } from 'src/app/shared/models/homework.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { HomeworkTableComponent } from './homework-table/homework-table.component';

@Component({
  selector: 'app-homework-page',
  templateUrl: './homework-page.component.html',
  styleUrls: ['./homework-page.component.css'],
})
export class HomeworkPageComponent implements OnInit, OnDestroy {
  @ViewChild(HomeworkTableComponent)
  homeworkTableComponent: HomeworkTableComponent;
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

  // --- auth data and subscriptions:
  private currentUserSubscription: Subscription | null;
  private currentSchoolSubscription: Subscription | null;

  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly userService: UserService,
    public readonly authStoreService: AuthStoreService,
    public readonly schoolService: SchoolService,
    public readonly homeworkService: HomeworkService,
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
    this.currentSchoolSubscription = this.currentSchool$.subscribe(
      (currentSchool) => {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain, @typescript-eslint/strict-boolean-expressions
        if (currentSchool && currentSchool._id) {
          forkJoin([
            this.userService.getAllBySchoolId(currentSchool._id),
            this.homeworkService.getAllBySchoolId(currentSchool._id),
          ])
            .pipe(
              first(),
              tap(() => {
                // this.currentSchoolSubscription = this.currentSchool$.subscribe();
                this.currentUserSubscription = this.currentUser$.subscribe();
              }),
              finalize(() => {
                this.homeworkPageLoading = false;
              })
            )
            .subscribe({
              next: ([users, homework]) => {
                console.log(homework);
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
      }
    );
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
    this.homeworkTableComponent.filterResults(text);
  }

  saveFeedback(feedback: { feedback: CommentDTO; homeworkId: string }): void {
    this.homeworkService.addComment(feedback).subscribe({
      next: () => {
        console.log('hit1');
        let message =
          'Feedback successfully added to homework. The student has been notified of your feedback.';
        if (feedback.feedback.commentType === 'submission') {
          message =
            'Thank you for submitting your homework. Your teacher has been notified and will provide you with feedback shortly.';
        }
        this.snackbarService.open('info', message);
        console.log('hit2');
        this.loadPageData();
        // this.getUnfinishedHomework();
      },
      error: (error: Error) => {
        this.snackbarService.openPermanent('error', error.message);
      },
    });
  }

  getUnfinishedHomework(
    selectedStudent: UserDTO | null
  ): Observable<HomeworkDTO[] | undefined> {
    return this.homework$.pipe(
      map(
        (homeworkList) =>
          homeworkList?.filter((homework) =>
            homework.students.filter(
              (student) =>
                student.studentId === selectedStudent?._id && !student.completed
            )
          )
      )
    );
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
          new Date(homeworkItem.dueDate).getTime() < new Date().getTime()
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
            (comment) => comment.student === studentId
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

  ngOnDestroy(): void {
    if (this.currentSchoolSubscription) {
      this.currentSchoolSubscription.unsubscribe();
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }
}
