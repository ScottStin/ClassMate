import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, first, forkJoin, Observable, Subscription } from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO, UserLoginDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit, OnDestroy {
  error: Error;
  isFlipped = false;
  schools$: Observable<SchoolDTO[]>;
  users$: Observable<UserDTO[]>;
  usersLoading = true;
  userType: 'student' | 'teacher' | 'school' | '' = '';
  photoSrc = '';
  selectedBackgroundImage = '../../../assets/triangles-1-pink-purple.png';
  private readonly routerSubscription: Subscription | undefined;

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly schoolService: SchoolService,
    private readonly snackbarService: SnackbarService,
    public readonly authStoreService: AuthStoreService,
    private readonly route: ActivatedRoute
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
        if (urlAddress.includes('school')) {
          this.userType = 'school';
          this.photoSrc = '../../../assets/School.png';
        }
        if (this.route.snapshot.data['pageType'] === 'signup') {
          this.isFlipped = false;
        }
        if (this.route.snapshot.data['pageType'] === 'login') {
          this.isFlipped = true;
        }
      }, 0);
    }); // todo = move routerSubscription to service
  }

  ngOnInit(): void {
    this.schools$ = this.schoolService.schools$;
    this.users$ = this.userService.users$;
    this.loadPageData();
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

  loadPageData(): void {
    this.usersLoading = true;
    forkJoin([this.schoolService.getAll(), this.userService.getAll()])
      .pipe(
        first(),
        finalize(() => {
          this.usersLoading = false;
        })
      )
      .subscribe({
        // next: ([schools, users]) => {
        //   console.log(schools);
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
              this.loadPageData();
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

  async signupSchool(school: SchoolDTO): Promise<void> {
    try {
      const res = await this.schoolService.create(school).toPromise();
      this.snackbarService.openPermanent(
        'info',
        `Wecome to ClassMate, ${school.name}!`
      );
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

  changeBackgroundImage({
    name,
    label,
    shadow,
  }: {
    name: string;
    label: string;
    shadow: string;
  }): void {
    this.selectedBackgroundImage = `../../../assets/${name}`;
    this.snackbarService.openPermanent(
      'info',
      "Can't decide on a good background image? Don't worry, you can always change it later!"
    );
  }
}
