import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { finalize, first, forkJoin, Observable, of } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { LessonService } from 'src/app/services/lesson-service/lesson.service';
import { LessonTypeService } from 'src/app/services/lesson-type-service/lesson-type.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { screenSizeBreakpoints } from 'src/app/shared/config';
import { LessonDTO, LessonTypeDTO } from 'src/app/shared/models/lesson.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  error: Error;
  mediumScreen = false;
  smallScreen = false;
  users$: Observable<UserDTO[]>;
  lessons$: Observable<LessonDTO[]>;
  lessonTypes$: Observable<LessonTypeDTO[]>;
  homePageLoading = true;

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
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.lessons$ = this.lessonService.lessons$;
    this.lessonTypes$ = this.lessonTypeService.lessonTypes$;
    this.loadPageData();
    this.mediumScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
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

  joinLesson(lesson: LessonDTO): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Wait! You have to sign in first',
        message:
          'You must be signed in to join a class. Click below to login or regiser a new account',
        okLabel: 'Login / Sign up',
        cancelLabel: 'Cancel',
        routerLink: 'student/signup',
      },
    });
  }
}
