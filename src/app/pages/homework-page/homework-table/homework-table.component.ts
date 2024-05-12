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
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { HomeworkDTO } from 'src/app/shared/models/homework.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-homework-table',
  templateUrl: './homework-table.component.html',
  styleUrls: ['./homework-table.component.scss'],
})
export class HomeworkTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<HomeworkDTO>;
  @Input() homeworkData: HomeworkDTO[] | null;
  @Input() users: UserDTO[] | null;
  @Input() homeworkPageLoading: boolean;
  @Output() openConfirmDeleteDialog = new EventEmitter<HomeworkDTO>();
  @Output() openEditHomeworkDialog = new EventEmitter<HomeworkDTO>();

  filterText: string;
  dataSource?: MatTableDataSource<HomeworkDTO> | undefined;
  displayedColumns = [
    'createdAt',
    'name',
    'description',
    'assignedTeacher',
    'students',
    'studentsOutstanding',
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
      anchor.download = attachmentUrl;
      anchor.click();
    }
  }
}
