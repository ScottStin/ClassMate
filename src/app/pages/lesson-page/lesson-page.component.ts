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
  lessons$: Observable<LessonDTO[]>;
  filteredLessons$: Observable<LessonDTO[]>;
  lessonPageLoading = true;
  pageName = '';

  // --- Subscriptions and auth data:
  private readonly routerSubscription: Subscription | undefined;
  private currentSchoolSubscription: Subscription | null;
  currentSchool$: Observable<SchoolDTO | null>;
  private currentUserSubscription: Subscription | null;
  currentUser$: Observable<UserDTO | null>;

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
    this.lessons$ = this.lessonService.lessons$;
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.currentUser$ = this.authStoreService.currentUser$;
    this.loadPageData();
    this.mediumScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
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
              next: ([users, lessons]) => {
                // --- sort lessons:
                lessons.sort((a, b) => {
                  const dateA = new Date(a.startTime);
                  const dateB = new Date(b.startTime);

                  if (dateA < dateB) {
                    return -1;
                  } else if (dateA > dateB) {
                    return 1;
                  } else {
                    return 0;
                  }
                });
                this.lessons$ = of(lessons);
                this.filteredLessons$ = of(lessons);

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

  getLessonStatus(lessonStatus: string, lesson: LessonDTO): boolean {
    const lessonStartTime = new Date(lesson.startTime);
    const currentDateTime = new Date();
    if (lessonStatus === 'Past Lessons') {
      return lessonStartTime < currentDateTime;
    } else {
      return lessonStartTime > currentDateTime;
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
}
