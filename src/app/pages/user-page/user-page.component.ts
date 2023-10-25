import { Component, OnInit } from '@angular/core';
import { finalize, first, Observable } from 'rxjs';
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
    private readonly snackbarService: SnackbarService
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
          console.log(res);
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

  addStudent(): void {
    console.log('test');
  }
}
