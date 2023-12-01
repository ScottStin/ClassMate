import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize, first, forkJoin, Observable, of } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { CreateExamDialogComponent } from 'src/app/components/create-exam-dialog/create-exam-dialog.component';
import { ExamTableComponent } from 'src/app/components/exam-table/exam-table.component';
import { ExamService } from 'src/app/services/exam-service/exam.service';
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
  error: Error;
  examTableComponent: ExamTableComponent;
  exams$: Observable<ExamDTO[]>;
  examPageLoading = false;
  demoExams: ExamDTO[];
  teachers$: Observable<UserDTO[]>;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  currentUser = JSON.parse(localStorage.getItem('auth_data_token')!) as
    | { user: UserDTO }
    | undefined;

  constructor(
    private readonly examService: ExamService,
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.exams$ = this.examService.exams$;
    this.getExams();
  }

  getExams(): void {
    this.examPageLoading = true;
    forkJoin([this.examService.getAll(), this.userService.getAll()])
      .pipe(
        first(),
        finalize(() => {
          this.examPageLoading = false;
        })
      )
      .subscribe({
        next: ([exams, users]) => {
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
              this.getExams();
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
      });
      dialogRef.afterClosed().subscribe((result: ExamDTO | undefined) => {
        if (result) {
          console.log(result);
        }
      });
    });
  }

  filterResults(text: string): void {
    this.examTableComponent.filterResults(text);
  }

  getUserExams(tab: string): ExamDTO[] {
    if (
      tab === 'My Exams' &&
      this.currentUser?.user.userType.toLowerCase() === 'teacher'
    ) {
      const exams = this.demoExams.filter(
        (obj) => obj.assignedTeacher === this.currentUser?.user.email
      );
      return exams; // return exams where the current teacher is the assigned marker
    } else if (
      tab === 'My Exams' &&
      this.currentUser &&
      this.currentUser.user.userType.toLowerCase() === 'student'
    ) {
      const exams = this.demoExams.filter((obj) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        obj.studentsEnrolled.includes(this.currentUser!.user.email)
      );
      return exams; // return exams where the current student is enrolled
    } else {
      return this.demoExams; // return all exams
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
            this.getExams();
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
