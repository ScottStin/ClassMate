/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { QuestionList } from '../create-exam-dialog/create-exam-dialog.component';
import { ShowExamDialogComponent } from '../show-exam-dialog/show-exam-dialog.component';
import { StudentsCompletedExamDialogComponent } from '../students-completed-exam-dialog/students-completed-exam-dialog.component';

@Component({
  selector: 'app-exam-table',
  templateUrl: './exam-table.component.html',
  styleUrls: ['./exam-table.component.scss'],
})
export class ExamTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<ExamDTO>;
  @Input() examData: ExamDTO[] | null;
  @Input() questionData: QuestionList[] | null;
  @Input() selectedTabIndex: number;
  @Input() users: UserDTO[] | null;
  @Input() currentUser: UserDTO | null;
  @Output() openEditExamDialog = new EventEmitter<ExamDTO>();
  @Output() openConfirmDeleteDialog = new EventEmitter<ExamDTO>();
  @Output() startExam = new EventEmitter<ExamDTO>();
  @Output() registerForExam = new EventEmitter<ExamDTO>();
  @Output() reloadExams = new EventEmitter();

  filterText: string;
  dataSource?: MatTableDataSource<ExamDTO> | undefined;
  displayedColumns = [
    'name',
    'description',
    'studentsEnrolled',
    'studentsCompleted',
    'casualPrice',
    'assignedTeacher',
    'createdAt',
    'default',
    'actions',
  ];

  constructor(
    public dialog: MatDialog,
    private readonly snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<ExamDTO>(this.examData ?? []);
    if (
      this.currentUser?.userType.toLowerCase() === 'student' ||
      !this.currentUser
    ) {
      this.displayedColumns = ['name', 'description', 'casualPrice', 'actions'];
      if (this.selectedTabIndex === 0) {
        this.displayedColumns = this.displayedColumns.filter(
          (item) => item !== 'casualPrice'
        );
        this.displayedColumns.splice(
          this.displayedColumns.length - 1,
          0,
          'result'
        );
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.table.dataSource = this.dataSource;
      this.dataSource.sortingDataAccessor = this.sortingDataAccessor.bind(this);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sortingDataAccessor(data: ExamDTO, property: any): any {
    switch (property) {
      case 'name':
        return data.name;
      case 'description':
        return data.description;
      case 'casualPrice':
        return data.casualPrice;
      case 'studentsEnrolled':
        return data.studentsEnrolled;
      case 'studentsCompleted':
        return data.studentsCompleted;
      case 'assignedTeacher':
        return data.assignedTeacher;
      case 'createdAt':
        return data.createdAt;
      case 'default':
        return data.default;
      default:
        return data._id;
    }
  }

  openEditDialogClick(exam: ExamDTO): void {
    this.openEditExamDialog.emit(exam);
  }

  openConfirmDeleteDialogClick(exam: ExamDTO): void {
    this.openConfirmDeleteDialog.emit(exam);
  }

  startExamClick(exam: ExamDTO): void {
    if (exam.casualPrice && exam.casualPrice > 0) {
      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Start exam?',
          message:
            'Once you start the exam, you may not be able to retake it again.',
          okLabel: `Start`,
          cancelLabel: `Cancel`,
          routerLink: '',
        },
      });
      confirmDialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          this.displayExam(exam, false, false, null);
        }
      });
    } else {
      this.displayExam(exam, false, false, null);
    }
  }

  enrolExam(exam: ExamDTO): void {
    let message = 'Are you sure you want to enrol in this exam?';
    if (exam.casualPrice && exam.casualPrice > 0) {
      message = `${message} Your account will be automatically charged <b>$${exam.casualPrice.toString()} USD </b>`;
    }
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Enrol in this exam?',
        message,
        okLabel: `Enrol`,
        cancelLabel: `Cancel`,
        routerLink: '',
      },
    });
    confirmDialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.registerForExam.emit(exam as ExamDTO | undefined);
      }
    });
  }

  studentCompleted(exam: ExamDTO): boolean {
    const result = exam.studentsCompleted.find(
      (obj) => obj.email === this.currentUser?.email
    );
    if (result) {
      return true;
    } else {
      return false;
    }
  }

  getResult(exam: ExamDTO): string | null | undefined | number {
    const result = exam.studentsCompleted.find(
      (obj) => obj.email === this.currentUser?.email
    );
    if (result?.mark === null) {
      return null;
    } else {
      return result?.mark;
    }
  }

  getStudentsEnrolledList(studentsEnrolled: string[]): string {
    const studentNameArray = [];
    for (const studentEmail of studentsEnrolled) {
      const studentName = this.getUserName(studentEmail);
      if (studentName !== null) {
        studentNameArray.push(`${studentName} (${studentEmail})`);
      } else {
        studentNameArray.push(`${studentEmail} (user deleted)`);
      }
    }
    return studentNameArray.join(', ');
  }

  getStudentsCompletedList(
    studentsCompleted: { email: string; mark: boolean }[]
  ): string {
    const studentEmails = studentsCompleted.map((obj) => obj.email);
    const studentNameArray = [];
    for (const studentEmail of studentEmails) {
      const studentName = this.getUserName(studentEmail);
      if (studentName !== null) {
        studentNameArray.push(`${studentName} (${studentEmail})`);
      } else {
        studentNameArray.push(`${studentEmail} (user deleted)`);
      }
    }
    return studentNameArray.join(', ');
  }

  getMarkPendingCompletedList(
    studentsCompleted: { email: string; mark: boolean }[]
  ): string | null {
    const studentNames = studentsCompleted
      .filter((obj) => !obj.mark)
      .map((obj) => obj.email);
    return studentNames.join(', ');
  }

  getUserName(userEmail: string): string | null {
    // TODO = replace with service or directive
    const foundUser = this.users?.find((obj) => obj.email === userEmail);
    if (foundUser) {
      return foundUser.name;
    } else {
      return null;
    }
  }

  openStudentsCompletedList(exam: ExamDTO): void {
    const studentsCompletedDialogRef = this.dialog.open(
      StudentsCompletedExamDialogComponent,
      {
        data: { exam },
      }
    );
    studentsCompletedDialogRef
      .afterClosed()
      .subscribe((result: { email: string } | null) => {
        if (result) {
          this.displayExam(exam, false, true, result.email);
        }
      });
  }

  examMarkPending(exam: ExamDTO): void {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Exam completed',
        message: `You have already completed this exam. Please wait while it's being marked. <br> <br> You can click below to view your answers.`,
        okLabel: `View answers`,
        cancelLabel: `Cancel`,
        routerLink: '',
      },
    });
    confirmDialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.displayExam(exam, true, false, null);
      }
    });
  }

  displayExam(
    exam: ExamDTO,
    displayMode: boolean, // used to view the exam only, students cannot answer questions and teachers cannot give feedback
    markMode: boolean,
    student?: string | null
  ): void {
    const questions = [];
    if (exam.questions && exam.questions.length > 0) {
      for (const question of exam.questions) {
        const foundQuestion = this.questionData?.find(
          (obj) => obj['_id'] === question
        );
        if (
          foundQuestion?.subQuestions !== undefined &&
          foundQuestion.subQuestions !== null &&
          foundQuestion.subQuestions.length > 0
        ) {
          const subQuestions = [];
          for (const subQuestion of foundQuestion.subQuestions) {
            const foundSubQuestion = this.questionData?.find(
              (obj) => obj['_id'] === subQuestion
            );
            if (foundSubQuestion) {
              subQuestions.push(foundSubQuestion);
            }
          }
          foundQuestion.subQuestions = subQuestions;
        }
        if (foundQuestion) {
          questions.push(foundQuestion);
        }
      }
      const dialogRef = this.dialog.open(ShowExamDialogComponent, {
        data: {
          title: exam.name,
          exam,
          questions,
          displayMode,
          markMode,
          student,
          currentUser: this.currentUser,
        },
        panelClass: 'fullscreen-dialog',
        // height: '100%',
        autoFocus: false,
        hasBackdrop: true,
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          this.reloadExams.emit();
        }
      });
    } else {
      this.snackbarService.openPermanent('error', 'This exam has no questions');
    }
  }

  filterResults(text: string): void {
    this.filterText = text;
    if (this.dataSource) {
      this.dataSource.filter = this.filterText;
    }
  }
}
