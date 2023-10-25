import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { finalize, first, forkJoin, Observable, of, Subscription } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { CreateLessonDialogComponent } from 'src/app/components/create-lesson-dialog/create-lesson-dialog.component';
import { LessonService } from 'src/app/services/lesson-service/lesson.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { screenSizeBreakpoints } from 'src/app/shared/config';
import { LessonDTO, LessonTypeDTO } from 'src/app/shared/models/lesson.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-lesson-page',
  templateUrl: './lesson-page.component.html',
  styleUrls: ['./lesson-page.component.css'],
})
export class LessonPageComponent implements OnInit, OnDestroy {
  error: Error;
  mediumScreen = false;
  smallScreen = false;
  users$: Observable<UserDTO[]>;
  lessons$: Observable<LessonDTO[]>;
  lessonPageLoading = true;
  pageName = '';
  private readonly routerSubscription: Subscription | undefined;

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
    this.loadPageData();
    this.mediumScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadPageData(): void {
    this.lessonPageLoading = true;
    forkJoin([this.userService.getAll(), this.lessonService.getAll()])
      .pipe(
        first(),
        finalize(() => {
          this.lessonPageLoading = false;
        })
      )
      .subscribe({
        next: ([users, lessons]) => {
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
  }

  createLesson(): void {
    const dialogRef = this.dialog.open(CreateLessonDialogComponent, {
      data: {
        title: 'Create New Lesson',
        rightButton: 'Create',
        leftButton: 'Cancel',
      },
    });
    dialogRef.afterClosed().subscribe((result: LessonDTO[] | undefined) => {
      if (result) {
        this.lessonService.create(result).subscribe({
          next: () => {
            this.snackbarService.open('info', 'Lessons successfully created');
          },
          error: (error: Error) => {
            this.error = error;
            this.snackbarService.openPermanent('error', error.message);
          },
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
}
