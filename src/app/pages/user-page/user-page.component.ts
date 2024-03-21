import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { finalize, first, Observable, of, Subscription, tap } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { EditUserDialogComponent } from 'src/app/components/edit-user-dialog/edit-user-dialog.component';
import { UserTableComponent } from 'src/app/components/user-table/user-table.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css'],
})
export class UserPageComponent implements OnInit {
  @ViewChild(UserTableComponent)
  userTableComponent: UserTableComponent;

  error: Error;
  userPageLoading = false;
  users$: Observable<UserDTO[]>;
  filteredUsers$: Observable<UserDTO[]>;
  userType: string;
  pageType: string;
  pageName = '';

  private currentSchoolSubscription: Subscription | null;
  currentSchool$: Observable<SchoolDTO | null>;

  private currentUserSubscription: Subscription | null;
  currentUser$: Observable<UserDTO | null>;

  constructor(
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    public dialog: MatDialog,
    private readonly route: ActivatedRoute,
    public readonly schoolService: SchoolService,
    public readonly authStoreService: AuthStoreService
  ) {
    this.userType = this.route.snapshot.data['userType'] as string;
    this.pageType = this.route.snapshot.data['pageType'] as string;
  }

  ngOnInit(): void {
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.currentUser$ = this.authStoreService.currentUser$;
    this.users$ = this.userService.users$;
    this.filteredUsers$ = this.userService.users$;
    this.getUsers();
    this.getPageName();
  }

  getPageName(): void {
    this.currentUser$.subscribe((currentUser) => {
      if (currentUser) {
        if (this.pageType === 'Table') {
          this.pageName = 'students';
        }
        if (this.pageType === 'Card') {
          if (this.userType === 'Teacher') {
            if (currentUser.userType.toLocaleLowerCase() === 'teacher') {
              this.pageName = 'colleagues';
            }
            if (currentUser.userType.toLocaleLowerCase() === 'student') {
              this.pageName = 'teachers';
            }
          }
          if (this.userType === 'Student') {
            if (currentUser.userType.toLocaleLowerCase() === 'teacher') {
              this.pageName = 'teachers';
            }
            if (currentUser.userType.toLocaleLowerCase() === 'student') {
              this.pageName = 'class mates';
            }
          }
        }
      }
    });
  }

  getUsers(): void {
    this.userPageLoading = true;
    this.userService
      .getAll()
      .pipe(
        first(),
        tap(() => {
          this.currentSchoolSubscription = this.currentSchool$.subscribe();
          this.currentUserSubscription = this.currentUser$.subscribe();
        }),
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
          this.filteredUsers$ = of(students);
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
    this.users$.pipe(first()).subscribe((res) => {
      const existingUsers = res;
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
          this.userService
            .update(
              {
                ...result,
                previousProfilePicture: data.user.profilePicture,
              },
              data.user._id !== null && data.user._id !== undefined
                ? data.user._id
                : ''
            )
            .subscribe({
              next: () => {
                this.snackbarService.open('info', 'User successfully updated');
                this.getUsers();
              },
              error: (error: Error) => {
                this.error = error;
                this.snackbarService.openPermanent('error', error.message);
              },
            });
        }
      });
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
      if (result && user._id !== null && user._id !== undefined) {
        this.userService.delete(user._id).subscribe({
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
    // eslint-disable-next-line no-console
    console.log('test');
  }

  filterResults(text: string): void {
    if (this.pageType.toLowerCase() === 'card') {
      this.users$.subscribe({
        next: (res) => {
          const students = res.filter(
            (obj: UserDTO) =>
              obj.name.toLowerCase().includes(text.toLowerCase()) ||
              obj.email.toLowerCase().includes(text.toLowerCase()) ||
              obj.nationality.toLowerCase().includes(text.toLowerCase()) ||
              obj.statement?.toLowerCase().includes(text.toLowerCase())
          );
          this.filteredUsers$ = of(students);
        },
      });
    }
    if (this.pageType.toLowerCase() === 'table') {
      this.userTableComponent.filterResults(text);
    }
  }
}
