import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first, Observable } from 'rxjs';
// import { AuthenticationService } from 'src/app/services/authentication-service/authentication.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { UserDTO, UserLoginDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent implements OnInit {
  error: Error;
  isFlipped = false;
  users$: Observable<UserDTO[]>;
  usersLoading = true;
  userType: 'student' | 'teacher' | '' = '';
  photoSrc = '';

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService // private readonly authenticationService: AuthenticationService
  ) {
    this.router.events.subscribe(() => {
      setTimeout(() => {
        const urlAddress: string[] = this.router.url.split('/');
        if (urlAddress.includes('student')) {
          this.userType = 'student';
          this.photoSrc = '../../../assets/Student.png';
        }
        if (urlAddress.includes('teacher')) {
          this.userType = 'teacher';
          this.photoSrc = '../../../assets/Teacher.png';
        }
        if (urlAddress.includes('signup')) {
          this.isFlipped = false;
        }
        if (urlAddress.includes('login')) {
          this.isFlipped = true;
        }
      }, 0);
    });
  }

  ngOnInit(): void {
    this.getUsers();
  }

  async onCardFlipped(isFlipped: boolean): Promise<void> {
    this.isFlipped = isFlipped;
    if (!this.isFlipped) {
      await this.router.navigateByUrl(`${this.userType}/signup`);
    } else {
      await this.router.navigateByUrl(`${this.userType}/login`);
    }
  }

  getUsers(): void {
    this.usersLoading = true;
    this.users$ = this.userService.users$;
    this.userService.getAll().subscribe({
      next: (res) => {
        console.log(res);
        this.usersLoading = false;
      },
      error: (error: Error) => {
        const snackbar = this.snackbarService.openPermanent(
          'error',
          'Error: Failed to load page.',
          'retry'
        );
        console.log(error);
        snackbar
          .onAction()
          .pipe(first())
          .subscribe(() => {
            this.getUsers();
          });
      },
    });
  }

  signup(user: UserDTO): void {
    this.userService.create(user).subscribe({
      next: (res: UserDTO) => {
        let message = '';
        if (res.userType === 'student') {
          message = `Thank you for joining, ${res.name}. Remember, your first class is free. But before you join you need to complete your free English Level Test. Click on 'My Exams' to get started.`;
        }
        if (res.userType === 'Teacher') {
          message = `Thank you for joining, ${res.name}. Click the 'My Classes' tab to schedule your first lesson`;
        }
        this.snackbarService.open('info', message);
      },
      error: (error: Error) => {
        this.error = error;
        this.snackbarService.openPermanent('error', error.message);
      },
    });
  }

  login(userDetails: UserLoginDTO): void {
    this.userService.login(userDetails).subscribe({
      next: (res) => {
        const response = res as { token: string; user: UserDTO };
        console.log(res);
        localStorage.setItem('token', response.token);
      },
      error: (error: Error) => {
        this.error = error;
        this.snackbarService.openPermanent('error', error.message);
      },
    });
  }
}
