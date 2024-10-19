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
  Subscription,
  tap,
} from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { LessonService } from 'src/app/services/lesson-service/lesson.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { screenSizeBreakpoints } from 'src/app/shared/config';
import { LessonDTO, LessonTypeDTO } from 'src/app/shared/models/lesson.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  error: Error;

  // --- screen sizes:
  mediumScreen = false;
  smallScreen = false;

  // --- data:
  users$: Observable<UserDTO[]>;
  homePageLoading = true;
  lessonTypes: LessonTypeDTO[] = [];

  // --- auth data and subscriptions:
  private currentUserSubscription: Subscription | null;
  currentUser$: Observable<UserDTO | null>;

  private currentSchoolSubscription: Subscription | null;
  currentSchool$: Observable<SchoolDTO | null>;

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
    private readonly snackbarService: SnackbarService,
    private readonly userService: UserService,
    private readonly lessonService: LessonService,
    public readonly authStoreService: AuthStoreService,
    public readonly schoolService: SchoolService,
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.currentUser$ = this.authStoreService.currentUser$;
    this.users$ = this.userService.users$;
    this.lessons$ = this.lessonService.lessons$;
    this.lessonSubscription = this.lessons$.pipe(first()).subscribe(() => {
      this.loadPageData();
    });
    this.loadPageData();
    this.mediumScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
  }

  loadPageData(): void {
    this.homePageLoading = true;
    this.currentSchoolSubscription = this.currentSchool$.subscribe(
      (currentSchool) => {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain, @typescript-eslint/strict-boolean-expressions
        if (currentSchool && currentSchool._id) {
          this.lessonTypes = currentSchool.lessonTypes;

          forkJoin([
            this.userService.getAllBySchoolId(currentSchool._id),
            this.lessonService.getAllBySchoolId(currentSchool._id),
          ])
            .pipe(
              first(),
              tap(() => {
                this.currentUserSubscription = this.currentUser$.subscribe();
              }),
              finalize(() => {
                this.homePageLoading = false;
              })
            )
            .subscribe({
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

  joinLesson(lesson: LessonDTO): void {
    let joinClass = true;
    let data = {
      title: 'Join this class?',
      message: 'A seat will be reserved for you in this lesson',
      okLabel: 'Join',
      cancelLabel: 'Cancel',
      routerLink: '',
    };
    this.currentUserSubscription = combineLatest([
      this.currentUser$,
      this.currentSchool$,
    ]).subscribe(([currentUser, currentSchool]) => {
      if (currentUser && !currentUser.level) {
        data = {
          title:
            'You must take your English level test before you can join this class',
          message:
            'In order to take this class we need to assess your level to see if it is the right class for you. <br> Click below to take your free English level test, it only takes a few minutes!',
          okLabel: 'Take my English level test',
          cancelLabel: 'Cancel',
          routerLink: currentSchool
            ? `${currentSchool.name.replace(/ /gu, '-').toLowerCase()}/exams`
            : 'student/signup',
        };
        joinClass = false;
      }
      if (!currentUser) {
        data = {
          title: 'Wait! You have to sign in first',
          message:
            'You must be signed in to join a class. Click below to login or regiser a new account',
          okLabel: 'Login / Sign up',
          cancelLabel: 'Cancel',
          routerLink: currentSchool
            ? `${currentSchool.name
                .replace(/ /gu, '-')
                .toLowerCase()}/student/signup`
            : 'student/signup',
        };
        joinClass = false;
      }
      const dialogRef = this.dialog.open(ConfirmDialogComponent, { data });
      if (currentUser?.level) {
        dialogRef.afterClosed().subscribe((result: boolean) => {
          if (result && joinClass) {
            this.lessonService.joinLesson(lesson, currentUser).subscribe({
              next: () => {
                this.snackbarService.open(
                  'info',
                  "A seat for you in this lesson has been reserved. You will be able to enter the lesson 5 minutes before the start time. Go to 'My Classes' to view all your lessons. "
                );

                // --- create notificaiton:
                this.notificationService
                  .create({
                    recipients: [lesson.teacher as string], // todo - this is the email. We need to replace with the user id
                    message: `${currentUser.name} has joined your lesson ${lesson.name}`,
                    createdBy: currentUser._id ?? '',
                    dateSent: new Date().getTime(),
                    seenBy: [],
                    schoolId: currentUser.schoolId as string,
                  })
                  .subscribe();

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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }

  cancelLesson(lesson: LessonDTO): void {
    const data = {
      title: 'Cancel this class?',
      message:
        'Your spot in this lesson will no longer be reserved and another student may take it. If the lessons is not full, you may be able to join again.',
      okLabel: 'Leave Lesson',
      cancelLabel: 'Close',
      routerLink: '',
    };
    this.currentUserSubscription = this.currentUser$.subscribe(
      (currentUser) => {
        if (currentUser) {
          const dialogRef = this.dialog.open(ConfirmDialogComponent, { data });
          dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
              this.lessonService.cancelLesson(lesson, currentUser).subscribe({
                next: () => {
                  this.snackbarService.open(
                    'info',
                    'You have successfully cancelled your place in this lesson.'
                  );

                  // --- create notificaiton:
                  this.notificationService
                    .create({
                      recipients: [lesson.teacher as string], // todo - this is the email. We need to replace with the user id
                      message: `${currentUser.name} has left your lesson ${lesson.name}`,
                      createdBy: currentUser._id ?? '',
                      dateSent: new Date().getTime(),
                      seenBy: [],
                      schoolId: currentUser.schoolId as string,
                    })
                    .subscribe();

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
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
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

  ngOnDestroy(): void {
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
