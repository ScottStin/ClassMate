import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { finalize, first, Observable, of } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { EditUserDialogComponent } from 'src/app/components/edit-user-dialog/edit-user-dialog.component';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { LevelDTO, UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css'],
})
export class UserPageComponent implements OnInit {
  error: Error;
  userPageLoading = false;
  users$: Observable<UserDTO[]>;
  userType: string;
  pageType: string;

  constructor(
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    public dialog: MatDialog,
    private readonly route: ActivatedRoute
  ) {
    this.userType = this.route.snapshot.data['userType'] as string;
    this.pageType = this.route.snapshot.data['pageType'] as string;
  }

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.getUsers();
    console.log(this.pageType);
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
            (user) =>
              user.userType.toLowerCase() === this.userType.toLowerCase()
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

  openEditUserDialog(data: { user: UserDTO; formType: string | null }): void {
    let existingUsers;
    this.users$.pipe(first()).subscribe((res) => {
      existingUsers = res;
    });
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      data: {
        title: `Edit ${data.user.name}`,
        user: data.user,
        existingUsers,
        formType: data.formType,
      },
    });
    dialogRef.afterClosed().subscribe((result: UserDTO | undefined) => {
      if (result) {
        console.log(result);
        this.userService.update(result, data.user._id!).subscribe({
          next: () => {
            this.snackbarService.open(
              'info',
              'User level successfully updated'
            );
            this.getUsers();
          },
          error: (error: Error) => {
            this.error = error;
            this.snackbarService.openPermanent('error', error.message);
          },
        });
      }
    });
  }

  openConfirmDeleteDialog(user: UserDTO): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Delete ${user.name}?`,
        message: `Are you sure you want to permanently delete this user? All their infomation will be erased. This action cannot be undone.`,
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });
    dialogRef.afterClosed().subscribe((result: UserDTO[] | undefined) => {
      if (result) {
        this.userService.delete(user._id!).subscribe({
          next: () => {
            this.snackbarService.open('info', 'User successfully deleted');
            this.getUsers();
          },
          error: (error: Error) => {
            this.error = error;
            this.snackbarService.openPermanent('error', error.message);
          },
        });
      }
    });
  }

  addStudent(): void {
    console.log('test');
  }
}
