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
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { UserDTO } from 'src/app/shared/models/user.model';

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
  @Output() openEditExamDialog = new EventEmitter<ExamDTO>();
  @Output() openConfirmDeleteDialog = new EventEmitter<ExamDTO>();
  @Output() registerForExam = new EventEmitter<ExamDTO>();

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

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  currentUser = JSON.parse(localStorage.getItem('auth_data_token')!) as
    | { user: UserDTO }
    | undefined;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<ExamDTO>(this.examData ?? []);
    if (
      this.currentUser?.user.userType.toLowerCase() === 'student' ||
      !this.currentUser
    ) {
      this.displayedColumns = [
        'name',
        'description',
        'casualPrice',
        'autoMarking',
        'actions',
      ];
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
      case 'autoMarking':
        return data.autoMarking;
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

  getStudentsList(studentsEnrolled: string[]): string {
    return studentsEnrolled.join(', ');
  }

  filterResults(text: string): void {
    this.filterText = text;
    if (this.dataSource) {
      console.log(this.filterText);
      this.dataSource.filter = this.filterText;
    }
  }
}
