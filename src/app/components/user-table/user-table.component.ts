import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
})
export class UserTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<UserDTO>;
  @Input() userData: UserDTO[] | null;
  @Output() openEditUserDialog = new EventEmitter<{
    user: UserDTO;
    formType: string | null;
  }>();
  @Output() openConfirmDeleteDialog = new EventEmitter<UserDTO>();

  filterText: string;
  dataSource?: MatTableDataSource<UserDTO> | undefined;
  displayedColumns = [
    'profilePicture',
    'name',
    'nationality',
    'email',
    'level',
    'createdAt',
    'actions',
  ];

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<UserDTO>(this.userData ?? []);
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
  private sortingDataAccessor(data: UserDTO, property: any): any {
    switch (property) {
      case 'name':
        return data.name;
      case 'nationality':
        return data.nationality;
      case 'email':
        return data.email;
      case 'level':
        return data.level;
      case 'createdAt':
        return data.createdAt;
      default:
        return '';
    }
  }

  filterChannels(data: string): void {
    this.filterText = data;
    if (this.dataSource) {
      this.dataSource.filter = this.filterText;
    }
  }

  cropImage(imageSrc: { url: string } | undefined): string {
    if (imageSrc?.url !== undefined) {
      return imageSrc.url.replace('/upload', '/upload/w_50,h_50,c_thumb,');
    } else {
      return '';
    }
  }

  setLevelClick(student: UserDTO): void {
    this.openEditUserDialog.emit({ user: student, formType: 'level' });
  }

  openEditDialogClick(student: UserDTO): void {
    this.openEditUserDialog.emit({ user: student, formType: 'student' });
  }

  openConfirmDeleteDialogClick(student: UserDTO): void {
    this.openConfirmDeleteDialog.emit(student);
  }
}
