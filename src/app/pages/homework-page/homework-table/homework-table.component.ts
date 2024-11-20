import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { StudentsEnrolledHomeworkDialogComponent } from 'src/app/components/students-enrolled-homework-dialog/students-enrolled-homework-dialog.component';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { HomeworkDTO } from 'src/app/shared/models/homework.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-homework-table',
  templateUrl: './homework-table.component.html',
  styleUrls: ['./homework-table.component.scss'],
})
export class HomeworkTableComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<HomeworkDTO>;
  @ViewChild('homeworkCardDialogTemplate')
  homeworkCardDialogTemplate!: TemplateRef<void>;

  @Input() homeworkData: HomeworkDTO[] | null;
  @Input() users: UserDTO[] | null;
  @Input() currentUser: UserDTO | null;
  @Input() homeworkPageLoading: boolean;
  @Output() openConfirmDeleteDialog = new EventEmitter<HomeworkDTO>();
  @Output() openEditHomeworkDialog = new EventEmitter<HomeworkDTO>();

  dialogRef: MatDialogRef<void>;
  selectedHomeworkItem: HomeworkDTO[]; // used for opening the homework card.
  filterText: string;
  dataSource?: MatTableDataSource<HomeworkDTO> | undefined;
  displayedColumns = [
    'createdAt',
    'name',
    'description',
    'assignedTeacherId',
    'students',
    // 'studentsOutstanding',
    'attachment',
    'dueDate',
    'actions',
  ];

  constructor(
    public dialog: MatDialog,
    private readonly snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<HomeworkDTO>(
      this.homeworkData ?? []
    );

    if (
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      this.currentUser?._id &&
      this.currentUser.userType.toLowerCase() === 'student'
    ) {
      // Get display columsn if user is student:
      this.displayedColumns = [
        'createdAt',
        'name',
        'description',
        'assignedTeacherId',
        'attachment',
        'dueDate',
        'actions',
      ];

      // If current user is student, filter homework to show only current user's homework:
      this.filterHomeworkForCurrentUser();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      'homeworkData' in changes &&
      this.homeworkData &&
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      this.currentUser?._id &&
      this.currentUser.userType.toLowerCase() === 'student'
    ) {
      this.filterHomeworkForCurrentUser();
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

  filterHomeworkForCurrentUser(): void {
    this.homeworkData =
      this.homeworkData?.filter((homework) =>
        homework.students
          .map((student) => student.studentId)
          .includes(this.currentUser?._id ?? '')
      ) ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sortingDataAccessor(data: HomeworkDTO, property: any): any {
    switch (property) {
      case 'name':
        return data.name;
      case 'description':
        return data.description;
      case 'createdAt':
        return data.createdAt;
      default:
        return data._id;
    }
  }

  getUserName(userId: string): string | null {
    // TODO = replace with service or directive
    const foundUser = this.users?.find((obj) => obj._id === userId);
    if (foundUser) {
      return foundUser.name;
    } else {
      return null;
    }
  }

  getUserEmail(userId: string): string | null {
    // TODO = replace with service or directive
    const foundUser = this.users?.find((obj) => obj._id === userId);
    if (foundUser) {
      return foundUser.email;
    } else {
      return null;
    }
  }

  openConfirmDeleteDialogClick(homework: HomeworkDTO): void {
    this.openConfirmDeleteDialog.emit(homework);
  }

  openEditDialogClick(homework: HomeworkDTO): void {
    this.openEditHomeworkDialog.emit(homework);
  }

  filterResults(text: string): void {
    this.filterText = text;
    if (this.dataSource) {
      this.dataSource.filter = this.filterText;
    }
  }

  downloadAttachment(attachmentUrl: string | null): void {
    if (attachmentUrl !== null) {
      const anchor = document.createElement('a');
      anchor.href = attachmentUrl;
      // anchor.download = attachmentUrl;
      anchor.target = '_blank';
      anchor.click();
    }
  }

  openHomeworkCard(homeworkItem: HomeworkDTO): void {
    this.selectedHomeworkItem = [homeworkItem];
    this.dialogRef = this.dialog.open(this.homeworkCardDialogTemplate, {
      panelClass: 'full-screen-homework-card-dialog',
      hasBackdrop: false,
    });
  }

  studentsIncompleteCounter(homeworkItem: HomeworkDTO): number {
    if (
      this.currentUser &&
      this.currentUser.userType.toLowerCase() === 'student'
    ) {
      return homeworkItem.students.find(
        (student) => student.studentId === this.currentUser?._id
      )?.completed ?? false
        ? 0
        : 1;
    } else {
      return homeworkItem.students.filter((student) => !student.completed)
        .length;
    }
  }

  getStudentsIncompleteList(homeworkItem: HomeworkDTO): string {
    const studentNameArray = [];
    const studentIdList = homeworkItem.students
      .filter((student) => !student.completed)
      .map((student) => student.studentId);
    for (const studentId of studentIdList) {
      const studentName = this.getUserName(studentId);
      const studentEmail = this.getUserEmail(studentId);
      if (studentName !== null && studentEmail !== null) {
        studentNameArray.push(`${studentName} (${studentEmail})`);
      } else {
        studentNameArray.push(`${studentId} (user deleted)`);
      }
    }
    return studentNameArray.join(', ');
  }

  getMarkingPendingList(homeworkItem: HomeworkDTO): {
    name: string | undefined;
    email: string | undefined;
    feedbackPending: true;
    completed: boolean | undefined;
  }[] {
    const studentList = [];
    for (const student of homeworkItem.students) {
      let feedbackPending = false;
      const studentComments = homeworkItem.comments?.filter(
        (comment) => comment.studentId === student.studentId
      );
      if (studentComments && studentComments.length > 0) {
        const lastComment = studentComments[studentComments.length - 1];
        feedbackPending = lastComment.commentType === 'submission';
      }
      if (feedbackPending) {
        studentList.push({
          name: this.users?.find((user) => user._id === student.studentId)
            ?.name,
          email: this.users?.find((user) => user._id === student.studentId)
            ?.email,
          feedbackPending,
          completed: homeworkItem.students.find(
            (obj) => obj.studentId === student.studentId
          )?.completed,
        });
      }
    }
    return studentList;
  }

  openStudentsIncompletedList(homeworkItem: HomeworkDTO): void {
    this.dialog.open(StudentsEnrolledHomeworkDialogComponent, {
      data: { homeworkItem },
    });
  }
}
