import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, first, Observable } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-teacher-page',
  templateUrl: './teacher-page.component.html',
  styleUrls: ['./teacher-page.component.css'],
})
export class TeacherPageComponent implements OnInit {
  teacherPageLoading = false;
  users$: Observable<UserDTO[]>;
  userType: string;

  constructor(
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    private readonly route: ActivatedRoute
  ) {
    this.userType = this.route.snapshot.data['userType'] as string;
  }

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.getUsers();
  }

  getUsers(): void {
    this.teacherPageLoading = true;
    this.userService
      .getAll()
      .pipe(
        first(),
        finalize(() => {
          this.teacherPageLoading = false;
        })
      )
      .subscribe({
        // next: (res) => {
        //   console.log(res);
        // },
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
}
