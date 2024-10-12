/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  combineLatest,
  finalize,
  first,
  forkJoin,
  Observable,
  of,
  Subscription,
  tap,
} from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { CreateLessonDialogComponent } from 'src/app/components/create-lesson-dialog/create-lesson-dialog.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { LessonService } from 'src/app/services/lesson-service/lesson.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { screenSizeBreakpoints } from 'src/app/shared/config';
import { LessonDTO } from 'src/app/shared/models/lesson.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-lesson-page',
  templateUrl: './lesson-page.component.html',
  styleUrls: ['./lesson-page.component.scss'],
})
export class LessonPageComponent implements OnInit, OnDestroy {
  // --- Scren sizes:
  mediumScreen = false;
  smallScreen = false;

  // --- Page data:
  error: Error;
  users$: Observable<UserDTO[]>;
  teachers$: Observable<UserDTO[]>;
  filteredLessons$: Observable<LessonDTO[]>;
  lessonPageLoading = true;
  pageName = '';

  // --- Subscriptions and auth data:
  private readonly routerSubscription: Subscription | undefined;
  private currentSchoolSubscription: Subscription | null;
  currentSchool$: Observable<SchoolDTO | null>;
  private currentUserSubscription: Subscription | null;
  currentUser$: Observable<UserDTO | null>;
  private lessonSubscription: Subscription | null;
  lessons$: Observable<LessonDTO[]>;

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.mediumScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.medium, 10);
    this.smallScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
  }

  constructor(
    private readonly router: Router,
    private readonly snackbarService: SnackbarService,
    private readonly userService: UserService,
    private readonly lessonService: LessonService,
    public readonly schoolService: SchoolService,
    public readonly authStoreService: AuthStoreService,
    public dialog: MatDialog
  ) {
    this.routerSubscription = this.router.events.subscribe(() => {
      setTimeout(() => {
        const urlAddress: string[] = this.router.url.split('/');
        if (urlAddress.includes('home')) {
          this.pageName = 'home';
        }
        if (urlAddress.includes('lessons')) {
          this.pageName = 'lessons';
        }
      }, 0);
    }); // todo = move routerSubscription to service
  }

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.currentUser$ = this.authStoreService.currentUser$;
    this.lessons$ = this.lessonService.lessons$;
    this.filteredLessons$ = this.lessons$;
    this.lessonSubscription = this.lessons$.pipe(first()).subscribe(() => {
      this.loadPageData();
    });
    this.loadPageData();
    this.mediumScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
  }

  loadPageData(): void {
    this.lessonPageLoading = true;
    this.currentSchoolSubscription = this.currentSchool$.subscribe(
      (currentSchool) => {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain, @typescript-eslint/strict-boolean-expressions
        if (currentSchool && currentSchool._id) {
          forkJoin([
            this.userService.getAllBySchoolId(currentSchool._id),
            this.lessonService.getAllBySchoolId(currentSchool._id),
          ])
            .pipe(
              first(),
              tap(() => {
                // this.currentSchoolSubscription = this.currentSchool$.subscribe();
                this.currentUserSubscription = this.currentUser$.subscribe();
              }),
              finalize(() => {
                this.lessonPageLoading = false;
              })
            )
            .subscribe({
              next: ([users]) => {
                // filter users for teachers:
                const teachers = users.filter(
                  (user) => user.userType.toLowerCase() === 'teacher'
                );
                this.teachers$ = of(teachers);
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

  // todo: move to lesson service:
  getLessonStatus(lessonStatus: string, lesson: LessonDTO): boolean {
    const lessonStartTime = new Date(lesson.startTime);
    const durationInMilliseconds = lesson.duration * 60 * 1000; // Convert duration from minutes to milliseconds
    const additionalTime = 15 * 60 * 1000; // 15 minutes in milliseconds
    const lessonEndTime = new Date(
      lessonStartTime.getTime() + durationInMilliseconds + additionalTime
    );

    const currentDateTime = new Date();

    if (lessonStatus === 'Past Lessons') {
      return lessonEndTime < currentDateTime; // Check if the lesson has ended
    } else {
      return lessonEndTime > currentDateTime; // Check if the lesson is ongoing or future
    }
  } // todo - move to lesson service

  createLesson(): void {
    this.currentUserSubscription = combineLatest([
      this.currentUser$,
      this.teachers$,
      this.currentSchool$,
    ])
      .pipe(first())
      .subscribe(([currentUser, teachers, currentSchool]) => {
        if (currentUser) {
          const dialogRef = this.dialog.open(CreateLessonDialogComponent, {
            data: {
              title: 'Create New Lesson',
              currentUser,
              teachers,
              currentSchool,
            },
          });
          dialogRef
            .afterClosed()
            .subscribe((result: LessonDTO[] | undefined) => {
              if (result) {
                this.lessonService.create(result).subscribe({
                  next: () => {
                    this.snackbarService.open(
                      'info',
                      'Lessons successfully created'
                    );
                    this.loadPageData();
                  },
                  error: (error: Error) => {
                    this.error = error;
                    this.snackbarService.openPermanent('error', error.message);
                  },
                });
              }
            });
        }
      });
  }

  deleteLesson(lesson: LessonDTO): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Are you sure you want to delete this lesson?',
        message:
          'This action cannot be undone. Once delete, all students who are currently enrolled will be removed from the lesson and notified. Students who have paid will automaticaly be refunded.',
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });
    dialogRef.afterClosed().subscribe((result: LessonDTO[] | undefined) => {
      if (result) {
        this.lessonService.delete(lesson).subscribe({
          next: () => {
            this.snackbarService.open('info', 'Lesson successfully deleted');
            this.loadPageData();
          },
          error: (error: Error) => {
            this.error = error;
            this.snackbarService.openPermanent('error', error.message);
          },
        });
      }
    });
  }

  startLesson(lesson: LessonDTO): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Start lesson?',
        message:
          'Once the lesson has started, all enrolled students will be able to join 5 minutes prior to the start time. If the class is not yet full, new students will still be able to enrol in the lesson and join.',
        okLabel: 'Start',
        cancelLabel: 'Cancel',
      },
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.lessonService.startLesson(lesson).subscribe({
          next: () => {
            this.snackbarService.open(
              'info',
              "Lesson started. You will now be redirected to the video call page in a new tab. If the redirect doesn't immediately happen, you can click the 'Enter Lesson' button on the lesson card."
            );
            this.loadPageData();
            if (lesson._id !== undefined) {
              this.enterLesson(lesson._id);
            }
          },
          error: (error: Error) => {
            this.error = error;
            this.snackbarService.openPermanent('error', error.message);
          },
        });
      }
    });
  }

  enterLesson(lessonId: string): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree([
        `/international-house/video-lesson/${lessonId}`,
      ])
    );
    window.open(url, '_blank');
  }

  filterResults(text: string): void {
    this.lessons$.subscribe({
      next: (res) => {
        const lessons = res.filter(
          (obj: LessonDTO) =>
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            obj.name?.toLowerCase().includes(text.toLowerCase()) ||
            obj.description.toLowerCase().includes(text.toLowerCase())
        );
        this.filteredLessons$ = of(lessons);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.currentSchoolSubscription) {
      this.currentSchoolSubscription.unsubscribe();
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
    if (this.lessonSubscription) {
      this.lessonSubscription.unsubscribe();
    }
  }
}
