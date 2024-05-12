import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { finalize, first, Observable, Subscription, tap } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-teacher-page',
  templateUrl: './teacher-page.component.html',
  styleUrls: ['./teacher-page.component.css'],
})
export class TeacherPageComponent implements OnInit, OnDestroy {
  error: Error;
  teacherPageLoading = false;
  users$: Observable<UserDTO[]>;
  userType: string;
  pageType: string;
  private currentSchoolSubscription: Subscription | null;
  currentSchool$: Observable<SchoolDTO | null>;

  constructor(
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    private readonly route: ActivatedRoute,
    public readonly schoolService: SchoolService,
    public dialog: MatDialog
  ) {
    this.userType = this.route.snapshot.data['userType'] as string;
    this.pageType = this.route.snapshot.data['pageType'] as string;
  }

  ngOnInit(): void {
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.users$ = this.userService.users$;
    this.getUsers();
  }

  getUsers(): void {
    this.teacherPageLoading = true;
    this.userService
      .getAll()
      .pipe(
        first(),
        tap(() => {
          this.currentSchoolSubscription = this.currentSchool$.subscribe();
        }),
        finalize(() => {
          this.teacherPageLoading = false;
        })
      )
      .subscribe({
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

  addStudent(): void {
    console.log('test');
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

  ngOnDestroy(): void {
    if (this.currentSchoolSubscription) {
      this.currentSchoolSubscription.unsubscribe();
    }
  }
}
