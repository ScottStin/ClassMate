import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  finalize,
  first,
  forkJoin,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import {
  CreateExamDialogComponent,
  QuestionList,
} from 'src/app/components/create-exam-dialog/create-exam-dialog.component';
import { ExamTableComponent } from 'src/app/components/exam-table/exam-table.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { ExamService } from 'src/app/services/exam-service/exam.service';
import { QuestionService } from 'src/app/services/question-service/question.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { defaultStyles } from 'src/app/shared/default-styles';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-exam-page',
  templateUrl: './exam-page.component.html',
  styleUrls: ['./exam-page.component.css'],
})
export class ExamPageComponent implements OnInit, OnDestroy {
  @ViewChild(ExamTableComponent)
  examTableComponent: ExamTableComponent;

  // --- page data:
  exams$: Observable<ExamDTO[]>;
  users$: Observable<UserDTO[]>;
  examPageLoading = false;
  teachers$: Observable<UserDTO[]>;
  questions$: Observable<QuestionList[]>;
  error: Error;
  selectedTabIndex: number;

  // --- subscriptions and auth data:
  private currentUserSubscription: Subscription | null;
  currentUser$: Observable<UserDTO | null>;

  private currentSchoolSubscription: Subscription | null;
  currentSchool$: Observable<SchoolDTO | null>;

  // --- Style:
  defaultStyles = defaultStyles;
  primaryButtonBackgroundColor =
    this.defaultStyles.primaryButtonBackgroundColor;
  primaryButtonTextColor = this.defaultStyles.primaryButtonTextColor;

  constructor(
    private readonly examService: ExamService,
    private readonly userService: UserService,
    private readonly questionService: QuestionService,
    private readonly snackbarService: SnackbarService,
    public readonly schoolService: SchoolService,
    public readonly authStoreService: AuthStoreService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.currentUser$ = this.authStoreService.currentUser$;
    this.exams$ = this.examService.exams$;
    this.users$ = this.userService.users$;
    this.questions$ = this.questionService.questions$;
    this.getCurrentSchoolDetails();
    this.loadPageData();
  }

  getCurrentSchoolDetails(): void {
    this.currentSchoolSubscription = this.currentSchool$.subscribe(
      (currentSchool) => {
        if (currentSchool) {
          const primaryButtonBackgroundColor =
            currentSchool.primaryButtonBackgroundColor as string | undefined;

          const primaryButtonTextColor =
            currentSchool.primaryButtonTextColor as string | undefined;

          if (primaryButtonBackgroundColor !== undefined) {
            this.primaryButtonBackgroundColor = primaryButtonBackgroundColor;
          }
          if (primaryButtonTextColor !== undefined) {
            this.primaryButtonTextColor = primaryButtonTextColor;
          }
        }
      }
    );
  }

  loadPageData(): void {
    this.currentSchoolSubscription = this.currentSchool$.subscribe();
    this.examPageLoading = true;
    forkJoin([
      this.examService.getAll(),
      this.userService.getAll(),
      this.questionService.getAll(),
    ])
      .pipe(
        first(),
        tap(() => {
          this.currentSchoolSubscription = this.currentSchool$.subscribe();
          this.currentUserSubscription = this.currentUser$.subscribe();
        }),
        finalize(() => {
          this.examPageLoading = false;
        })
      )
      .subscribe({
        next: ([, users]) => {
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

  createExam(): void {
    this.teachers$.pipe(first()).subscribe((res) => {
      const teachers = res;
      const dialogRef = this.dialog.open(CreateExamDialogComponent, {
        data: {
          title: `Create New Exam`,
          exam: null,
          okLabel: 'Delete',
          cancelLabel: 'Cancel',
          teachers,
          primaryButtonBackgroundColor: this.primaryButtonBackgroundColor,
        },
        panelClass: 'fullscreen-dialog',
        autoFocus: false,
        hasBackdrop: true,
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result: ExamDTO | undefined) => {
        if (result) {
          this.loadPageData();
        }
      });
    });
  }

  filterResults(text: string): void {
    this.examTableComponent.filterResults(text);
  }

  getUserExams(tab: string): Observable<ExamDTO[]> {
    return this.currentUser$.pipe(
      switchMap((currentUser) => {
        if (
          tab === 'My Exams' &&
          currentUser?.userType.toLowerCase() === 'teacher'
        ) {
          return this.exams$.pipe(
            first(),
            map((res) =>
              res.filter((obj) => obj.assignedTeacher === currentUser.email)
            )
          );
        } else if (
          tab === 'My Exams' &&
          currentUser &&
          currentUser.userType.toLowerCase() === 'student'
        ) {
          return this.exams$.pipe(
            first(),
            map((res) =>
              res.filter((obj) =>
                obj.studentsEnrolled.includes(currentUser.email)
              )
            )
          );
        } else {
          return this.exams$.pipe(first());
        }
      })
    );
  }

  openEditExamDialog(exam: ExamDTO): void {
    console.log(exam);
  }

  openConfirmDeleteDialog(exam: ExamDTO): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Delete exam?`,
        message: `Are you sure you want to permanently delete this eam? All users currently enrolled in the exam will lose access. Users who are enrolled and have paid for the exam without completing it will be refunded.`,
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });
    dialogRef.afterClosed().subscribe((result: UserDTO[] | undefined) => {
      if (result) {
        this.examService.delete(exam).subscribe({
          next: () => {
            this.snackbarService.open('info', 'Exam successfully deleted');
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

  changeTabs(): void {
    this.selectedTabIndex = 0;
  }

  startExam(exam: ExamDTO): void {
    console.log(exam);
  }

  registerForExam(exam: ExamDTO): void {
    this.currentUserSubscription = this.currentUser$.subscribe(
      (currentUser) => {
        if (currentUser) {
          this.examService.registerForExam(exam, currentUser).subscribe({
            next: () => {
              this.snackbarService.open(
                'info',
                "This exam has been added to your exam list in 'My Exams;'"
              );
              this.changeTabs();
              this.loadPageData();
            },
            error: (error: Error) => {
              this.error = error;
              this.snackbarService.openPermanent('error', error.message);
            },
          });
        }
      }
    );
  }

  reloadExams(): void {
    this.loadPageData();
  }

  ngOnDestroy(): void {
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
    if (this.currentSchoolSubscription) {
      this.currentSchoolSubscription.unsubscribe();
    }
  }
}
