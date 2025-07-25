import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  combineLatest,
  finalize,
  first,
  Observable,
  of,
  Subscription,
  tap,
} from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { EditUserDialogComponent } from 'src/app/components/edit-user-dialog/edit-user-dialog.component';
import { UserTableComponent } from 'src/app/pages/user-page/user-table/user-table.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { defaultStyles } from 'src/app/shared/default-styles';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@UntilDestroy()
@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css'],
})
export class UserPageComponent implements OnInit, OnDestroy {
  @ViewChild(UserTableComponent)
  userTableComponent: UserTableComponent;

  // --- page data:
  error: Error;
  userPageLoading = false;
  filteredUsers$: Observable<UserDTO[]>;
  userType: string;
  pageType: string;
  pageName = '';
  tabs = [
    { label: 'All' },
    {
      label: 'Active',
      description: 'Students who have logged on in the last 30 days.',
    },
    {
      label: 'Inactive',
      description: 'Students with over 30 days of inactivity.',
    },
  ];

  // --- auth data and subscriptions:
  private currentSchoolSubscription: Subscription | null;
  currentSchool$: Observable<SchoolDTO | null>;
  private currentUserSubscription: Subscription | null;
  currentUser$: Observable<UserDTO | null>;
  users$: Observable<UserDTO[]>;

  // --- styles:
  defaultStyles = defaultStyles;
  primaryButtonBackgroundColor =
    this.defaultStyles.primaryButtonBackgroundColor;
  primaryButtonTextColor = this.defaultStyles.primaryButtonTextColor;

  constructor(
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    public dialog: MatDialog,
    private readonly route: ActivatedRoute,
    public readonly schoolService: SchoolService,
    public readonly authStoreService: AuthStoreService,
    public readonly notificationService: NotificationService
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
    this.currentUserSubscription = this.currentUser$.subscribe(
      (currentUser) => {
        if (currentUser) {
          if (this.pageType === 'Table') {
            this.pageName = 'students';
          }
          if (this.pageType === 'Card') {
            if (this.userType === 'Teacher') {
              if (currentUser.userType.toLowerCase() === 'teacher') {
                this.pageName = 'colleagues';
              }
              if (currentUser.userType.toLowerCase() === 'student') {
                this.pageName = 'teachers';
              }
              if (currentUser.userType.toLowerCase() === 'school') {
                this.pageName = 'teachers';
              }
            }
            if (this.userType === 'Student') {
              if (currentUser.userType.toLowerCase() === 'teacher') {
                this.pageName = 'teachers';
              }
              if (currentUser.userType.toLowerCase() === 'student') {
                this.pageName = 'class mates';
              }
              if (currentUser.userType.toLowerCase() === 'school') {
                this.pageName = 'teachers';
              }
            }
          }
        }
      }
    );
  }

  getUsers(): void {
    this.userPageLoading = true;
    // todo, replace with this.currentSchool$.getValue()
    this.currentSchool$.subscribe((currentSchool) => {
      if (currentSchool?._id) {
        this.userService
          .getAllBySchoolId(currentSchool._id)
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
              this.snackbarService.queueBar(
                'error',
                `Error: Failed to load page: ${error.message}`,
                {
                  label: `retry`,
                  registerAction: (onAction: Observable<void>) =>
                    onAction.pipe(untilDestroyed(this)).subscribe(() => {
                      this.getUsers();
                    }),
                }
              );
            },
          });
      }
    });
  }

  openEditUserDialog(data: { user: UserDTO; formType: string | null }): void {
    this.users$.pipe(untilDestroyed(this), first()).subscribe((res) => {
      const existingUsers = res;
      const dialogRef = this.dialog.open(EditUserDialogComponent, {
        data: {
          title: `Edit ${data.user.name}`,
          currentUser: data.user,
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
                // schoolId: '661a7220882c5afa9a6a324b',
              },
              data.user._id
            )
            .subscribe({
              next: () => {
                this.snackbarService.queueBar(
                  'info',
                  'User successfully updated.'
                );
                if (result.level?.shortName !== data.user.level?.shortName) {
                  this.notificationService
                    .create({
                      recipients: [data.user._id],
                      message: `Your English level has been changed ${
                        result.level?.longName
                          ? `to ${result.level.longName}`
                          : ''
                      }`,
                      createdBy: data.user.schoolId as string,
                      dateSent: new Date().getTime(),
                      seenBy: [],
                      schoolId: data.user.schoolId as string,
                      link: 'lessons',
                    })
                    .pipe(untilDestroyed(this))
                    .subscribe();
                }
                this.getUsers();
              },
              error: (error: Error) => {
                this.error = error;
                this.snackbarService.queueBar('error', error.message);
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
      if (result) {
        this.userService.delete(user._id).subscribe({
          next: () => {
            this.snackbarService.queueBar('info', 'User successfully deleted.');
            this.getUsers();
          },
          error: (error: Error) => {
            this.error = error;
            this.snackbarService.queueBar('error', error.message);
          },
        });
      }
    });
  }

  addStudent(): void {
    combineLatest([this.users$, this.currentSchool$])
      .pipe(first())
      .subscribe(([users, currentSchool]) => {
        const dialogRef = this.dialog.open(EditUserDialogComponent, {
          data: {
            title: `${
              this.pageName.toLocaleLowerCase() === 'students'
                ? 'Create new student'
                : 'Create new teacher'
            }`,
            currentUser: null,
            existingUsers: users,
            teacherForm: this.pageName.toLocaleLowerCase() !== 'students',
          },
        });
        dialogRef.afterClosed().subscribe((result: UserDTO | undefined) => {
          if (result && currentSchool?._id) {
            this.userPageLoading = true;

            this.userService
              .create({
                ...result,
                userType:
                  this.pageName.toLocaleLowerCase() === 'students'
                    ? 'student'
                    : 'teacher',
                schoolId: currentSchool._id,
              })
              .pipe(
                finalize(() => {
                  this.userPageLoading = false;
                })
              )
              .subscribe({
                next: () => {
                  this.snackbarService.queueBar(
                    'info',
                    'User successfully created'
                  );
                  this.getUsers();
                },
                error: (error: Error) => {
                  this.error = error;
                  this.snackbarService.queueBar('error', error.message);
                },
              });
          }
        });
      });
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

  ngOnDestroy(): void {
    if (this.currentSchoolSubscription) {
      this.currentSchoolSubscription.unsubscribe();
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }
}
