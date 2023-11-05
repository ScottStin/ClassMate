import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize, first, Observable, of } from 'rxjs';
import { EditUserDialogComponent } from 'src/app/components/edit-user-dialog/edit-user-dialog.component';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css'],
})
export class UserPageComponent implements OnInit {
  userPageLoading = false;
  users$: Observable<UserDTO[]>;

  constructor(
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.getUsers();
  }

  getUsers(): void {
    this.userPageLoading = true;
    this.userService
      .getAll()
      .pipe(
        first(),
        finalize(() => {
          this.userPageLoading = false;
        })
      )
      .subscribe({
        next: (res) => {
          const students = res.filter(
            (user) => user.userType.toLowerCase() === 'student'
          );
          this.users$ = of(students);
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
              this.getUsers();
            });
        },
      });
  }

  openSetLevelDialog(student: UserDTO): void {
    const users = this.users$.pipe(first()).subscribe();
    this.dialog.open(EditUserDialogComponent, {
      data: {
        title: 'Set User Level',
        user: student,
        existingUsers: users,
      },
    });
  }

  addStudent(): void {
    console.log('test');
  }
}
