import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize, first, forkJoin, map, Observable, of } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import {
  CreateExamDialogComponent,
  QuestionList,
} from 'src/app/components/create-exam-dialog/create-exam-dialog.component';
import { ExamTableComponent } from 'src/app/components/exam-table/exam-table.component';
import { ShowExamDialogComponent } from 'src/app/components/show-exam-dialog/show-exam-dialog.component';
import { ExamService } from 'src/app/services/exam-service/exam.service';
import { QuestionService } from 'src/app/services/question-service/question.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { DemoExams } from 'src/app/shared/demo-data';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-exam-page',
  templateUrl: './exam-page.component.html',
  styleUrls: ['./exam-page.component.css'],
})
export class ExamPageComponent implements OnInit {
  @ViewChild(ExamTableComponent)
  examTableComponent: ExamTableComponent;
  error: Error;
  exams$: Observable<ExamDTO[]>;
  examPageLoading = false;
  demoExams: ExamDTO[];
  teachers$: Observable<UserDTO[]>;
  questions$: Observable<QuestionList[]>;
  currentUser = JSON.parse(localStorage.getItem('auth_data_token')!) as
    | { user: UserDTO }
    | undefined;
  selectedTabIndex: number;

  constructor(
    private readonly examService: ExamService,
    private readonly userService: UserService,
    private readonly questionService: QuestionService,
    private readonly snackbarService: SnackbarService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.exams$ = this.examService.exams$;
    this.questions$ = this.questionService.questions$;
    this.loadPageData();
  }

  loadPageData(): void {
    this.examPageLoading = true;
    forkJoin([
      this.examService.getAll(),
      this.userService.getAll(),
      this.questionService.getAll(),
    ])
      .pipe(
        first(),
        finalize(() => {
          this.examPageLoading = false;
        })
      )
      .subscribe({
        next: ([exams, users, questions]) => {
          console.log(questions);
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
    this.demoExams = DemoExams;
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
    if (
      tab === 'My Exams' &&
      this.currentUser?.user.userType.toLowerCase() === 'teacher'
    ) {
      return this.exams$.pipe(
        first(),
        map((res) =>
          res.filter(
            (obj) => obj.assignedTeacher === this.currentUser?.user.email // return exams where the current teacher is the assigned marker
          )
        )
      );
    } else if (
      tab === 'My Exams' &&
      this.currentUser &&
      this.currentUser.user.userType.toLowerCase() === 'student'
    ) {
      return this.exams$.pipe(
        first(),
        map((res) =>
          res.filter(
            (obj) => obj.studentsEnrolled.includes(this.currentUser!.user.email) // return exams where the current student is enrolled
          )
        )
      );
    } else {
      return this.exams$.pipe(first()); // return all exams
    }
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
    this.examService.registerForExam(exam, this.currentUser!.user).subscribe({
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
