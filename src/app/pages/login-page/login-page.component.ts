import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first, Observable, Subscription } from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { UserDTO, UserLoginDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent implements OnInit, OnDestroy {
  error: Error;
  isFlipped = false;
  users$: Observable<UserDTO[]>;
  usersLoading = true;
  userType: 'student' | 'teacher' | '' = '';
  photoSrc = '';
  private readonly routerSubscription: Subscription | undefined;

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    public readonly authStoreService: AuthStoreService
  ) {
    this.routerSubscription = this.router.events.subscribe(() => {
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
    }); // todo = move routerSubscription to service
  }

  ngOnInit(): void {
    this.getUsers();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
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
      next: () => {
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

  async signup(user: UserDTO): Promise<void> {
    try {
      user.userType = this.userType;
      const res = await this.userService.create(user).toPromise();
      let message = '';
      if (res?.userType === 'student') {
        message = `Thank you for joining, ${res.name}. Remember, your first class is free. But before you join, you need to complete your free English Level Test. Click on 'My Exams' to get started.`;
        this.login(user, message, true);
      } else if (res?.userType === 'Teacher') {
        message = `Thank you for joining, ${res.name}. Click the 'My Classes' tab to schedule your first lesson`;
        this.login(user, message, true);
      } else {
        this.snackbarService.openPermanent('error', 'unable to sign up');
      }
    } catch (error) {
      this.snackbarService.openPermanent('error', 'unable to sign up');
    }
  }

  login(userDetails: UserLoginDTO, message: string, signup?: boolean): void {
    this.authStoreService.login(userDetails).subscribe(
      () => {
        this.router
          .navigateByUrl('/home')
          .then(() => {
            const firstName = (
              JSON.parse(localStorage.getItem('auth_data_token')!) as {
                user: UserDTO;
              }
            ).user.name.split(' ')[0]; // todo - move firstname generator to auth.store.service
            if (!(signup ?? false)) {
              this.snackbarService.open('info', `Welcome back, ${firstName}!`);
            } else {
              this.snackbarService.open('info', message);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      },
      (error) => {
        console.log(error);
        this.snackbarService.openPermanent(
          'error',
          'Username or Password Incorrect'
        );
      }
    );
  }
}
