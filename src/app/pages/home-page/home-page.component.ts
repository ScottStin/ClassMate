import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  finalize,
  first,
  forkJoin,
  Observable,
  of,
  Subscription,
  tap,
} from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { LessonService } from 'src/app/services/lesson-service/lesson.service';
import { LessonTypeService } from 'src/app/services/lesson-type-service/lesson-type.service';
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
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  error: Error;
  mediumScreen = false;
  smallScreen = false;
  users$: Observable<UserDTO[]>;
  lessons$: Observable<LessonDTO[]>;
  lessonTypes$: Observable<LessonTypeDTO[]>;
  homePageLoading = true;
  currentUser: UserDTO | null;
  private currentSchoolSubscription: Subscription | null;
  currentSchool$: Observable<SchoolDTO | null>;

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
    private readonly lessonTypeService: LessonTypeService,
    private readonly authStoreService: AuthStoreService,
    public readonly schoolService: SchoolService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.users$ = this.userService.users$;
    this.lessons$ = this.lessonService.lessons$;
    this.lessonTypes$ = this.lessonTypeService.lessonTypes$;
    this.loadPageData();
    this.mediumScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
    if (localStorage.getItem('auth_data_token') !== null) {
      this.currentUser = (
        JSON.parse(localStorage.getItem('auth_data_token')!) as {
          user: UserDTO;
        }
      ).user;
    }
  }

  loadPageData(): void {
    this.homePageLoading = true;
    forkJoin([
      this.userService.getAll(),
      this.lessonService.getAll(),
      this.lessonTypeService.getAll(),
    ])
      .pipe(
        first(),
        tap(() => {
          this.currentSchoolSubscription = this.currentSchool$.subscribe();
        }),
        finalize(() => {
          this.homePageLoading = false;
        })
      )
      .subscribe({
        next: ([users, lessons, lessonTypes]) => {
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

  getLessonStatus(lessonStatus: string, lesson: LessonDTO): boolean {
    const lessonStartTime = new Date(lesson.startTime);
    const currentDateTime = new Date();
    if (lessonStatus === 'Past Lessons') {
      return lessonStartTime < currentDateTime;
    } else {
      return lessonStartTime > currentDateTime;
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
    if (!this.currentUser) {
      data = {
        title: 'Wait! You have to sign in first',
        message:
          'You must be signed in to join a class. Click below to login or regiser a new account',
        okLabel: 'Login / Sign up',
        cancelLabel: 'Cancel',
        routerLink: 'student/signup',
      };
      joinClass = false;
    }
    if (this.currentUser && !this.currentUser.level) {
      data = {
        title:
          'You must take your English level test before you can join this class',
        message:
          'In order to take this class we need to assess your level to see if it is the right class for you. <br> Click below to take your free English level test, it only takes a few minutes!',
        okLabel: 'Take my English level test',
        cancelLabel: 'Cancel',
        routerLink: 'exams',
      };
      joinClass = false;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result && joinClass) {
        this.lessonService.joinLesson(lesson, this.currentUser!).subscribe({
          next: () => {
            this.snackbarService.open(
              'info',
              "A seat for you in this lesson has been reserved. You will be able to enter the lesson 5 minutes before the start time. Go to 'My Classes' to view all your lessons. "
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

  cancelLesson(lesson: LessonDTO): void {
    const data = {
      title: 'Cancel this class?',
      message:
        'Your spot in this lesson will no longer be reserved and another student may take it. If the lessons is not full, you may be able to join again.',
      okLabel: 'Leave Lesson',
      cancelLabel: 'Close',
      routerLink: '',
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.lessonService.cancelLesson(lesson, this.currentUser!).subscribe({
          next: () => {
            this.snackbarService.open(
              'info',
              'You have successfully cancelled your place in this lesson.'
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

  ngOnDestroy(): void {
    if (this.currentSchoolSubscription) {
      this.currentSchoolSubscription.unsubscribe();
    }
  }
}
