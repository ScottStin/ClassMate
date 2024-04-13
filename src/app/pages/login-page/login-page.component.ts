import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  filter,
  finalize,
  first,
  forkJoin,
  Observable,
  Subscription,
} from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import {
  BackgroundImageDTO,
  backgroundImages,
} from 'src/app/shared/background-images';
import { defaultStyles } from 'src/app/shared/default-styles';
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
  photoSrc = '';

  schools$: Observable<SchoolDTO[]>;
  users$: Observable<UserDTO[]>;
  usersLoading = true;
  userType: 'student' | 'teacher' | 'school' | '' = '';

  currentSchool$: Observable<SchoolDTO | null>;
  private currentSchoolSubscription: Subscription | undefined;
  // currentSchool: SchoolDTO | undefined = undefined;

  private currentUserSubscription: Subscription | null;
  currentUser$: Observable<UserDTO | null>;

  private routerSubscription: Subscription | undefined;

  backgroundImages = backgroundImages;
  defaultStyles = defaultStyles;
  selectedBackgroundImage: BackgroundImageDTO | null =
    this.defaultStyles.selectedBackgroundImage;
  primaryButtonBackgroundColor =
    this.defaultStyles.primaryButtonBackgroundColor;
  primaryButtonTextColor = this.defaultStyles.primaryButtonTextColor;

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly schoolService: SchoolService,
    private readonly snackbarService: SnackbarService,
    public readonly authStoreService: AuthStoreService,
    private readonly route: ActivatedRoute
  ) {
    this.getRouterDetails();
  }

  getRouterDetails(): void {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const urlAddress: string[] = this.router.url.split('/');

        if (
          [urlAddress[2].toLowerCase(), urlAddress[1].toLowerCase()].includes(
            'student'
          )
        ) {
          this.userType = 'student';
          this.photoSrc = '../../../assets/Student.png';
        } else if (
          [urlAddress[2].toLowerCase(), urlAddress[1].toLowerCase()].includes(
            'teacher'
          )
        ) {
          this.userType = 'teacher';
          this.photoSrc = '../../../assets/Teacher.png';
        } else if (
          [urlAddress[2].toLowerCase(), urlAddress[1].toLowerCase()].includes(
            'school'
          )
        ) {
          this.userType = 'school';
          this.photoSrc = '../../../assets/School.png';
        }

        if (
          this.route.snapshot.firstChild &&
          this.route.snapshot.firstChild.data['pageType'] === 'signup'
        ) {
          this.isFlipped = false;
          if (this.userType === 'school') {
            this.schoolService.schoolLogout();
          }
        } else if (
          this.route.snapshot.firstChild &&
          this.route.snapshot.firstChild.data['pageType'] === 'login'
        ) {
          this.isFlipped = true;
        }
      });
  }

  ngOnInit(): void {
    this.schools$ = this.schoolService.schools$;
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.currentUser$ = this.authStoreService.currentUser$;
    this.users$ = this.userService.users$;
    this.loadPageData();
    this.getCurrentSchoolDetails();
  }

  getCurrentSchoolDetails(): void {
    this.currentSchoolSubscription = this.currentSchool$.subscribe(
      (currentSchool) => {
        if (currentSchool) {
          const backgroundImage = currentSchool.backgroundImage as
            | BackgroundImageDTO
            | undefined;

          const primaryButtonBackgroundColor =
            currentSchool.primaryButtonBackgroundColor as string | undefined;

          const primaryButtonTextColor =
            currentSchool.primaryButtonTextColor as string | undefined;

          const logo = currentSchool.logo;

          if (backgroundImage !== undefined) {
            this.selectedBackgroundImage = backgroundImage;
          } else {
            // this.selectedBackgroundImage = this.backgroundImages[0];
            this.selectedBackgroundImage =
              this.defaultStyles.selectedBackgroundImage;
          }
          if (primaryButtonBackgroundColor !== undefined) {
            this.primaryButtonBackgroundColor = primaryButtonBackgroundColor;
          }
          if (primaryButtonTextColor !== undefined) {
            this.primaryButtonTextColor = primaryButtonTextColor;
          }
          if (logo) {
            this.photoSrc = logo.url;
          }
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.currentSchoolSubscription) {
      this.currentSchoolSubscription.unsubscribe();
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }

  async onCardFlipped(data: {
    isFlipped: boolean;
    removeCurrentSchool: boolean | undefined;
  }): Promise<void> {
    this.isFlipped = data.isFlipped;
    try {
      const currentSchool = await this.currentSchool$.pipe(first()).toPromise();
      let navPrefix = '';
      if (currentSchool) {
        navPrefix = `${currentSchool.name.replace(/ /gu, '-').toLowerCase()}/`;
      }

      if (!this.isFlipped && data.removeCurrentSchool === undefined) {
        await this.router.navigateByUrl(`${navPrefix}${this.userType}/signup`);
      } else if (this.isFlipped && data.removeCurrentSchool === undefined) {
        await this.router.navigateByUrl(`${navPrefix}${this.userType}/login`);
      } else if (!this.isFlipped && data.removeCurrentSchool !== undefined) {
        await this.router.navigateByUrl('school/signup');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('An error occurred:', error);
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
      await this.schoolService.create(school).toPromise();
      this.login(
        { email: school.email, unhashedPassword: school.unhashedPassword },
        `Welcome to ClassMate, ${school.name}!`,
        true
      );
      this.login(
        { email: school.email, unhashedPassword: school.unhashedPassword },
        `Welcome to ClassMate, ${school.name}!`,
        true,
        `${school.name.replace(/ /gu, '-').toLowerCase()}/home`
      );
      // const urlPath = `${school.name.replace(/ /gu, '-').toLowerCase()}/home`;
      // await this.router.navigateByUrl('test-new-school-6/home');
    } catch (error) {
      this.snackbarService.openPermanent('error', 'unable to sign up');
    }
  }

  login(
    userDetails: UserLoginDTO,
    message: string,
    signup?: boolean,
    route?: string
  ): void {
    this.currentSchool$.pipe(first()).subscribe(
      (currentSchool) => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (currentSchool?._id) {
          this.authStoreService
            .login(userDetails, currentSchool._id)
            .subscribe(() => {
              this.router
                .navigateByUrl(
                  route !== undefined
                    ? route
                    : `/${currentSchool.name
                        .replace(/ /gu, '-')
                        .toLowerCase()}/home`
                )
                .then(() => {
                  this.currentUserSubscription = this.currentUser$.subscribe(
                    (currentUser) => {
                      if (currentUser) {
                        const firstName = currentUser.name.split(' ')[0]; // todo - move firstname generator to auth.store.service
                        if (!(signup ?? false)) {
                          this.snackbarService.open(
                            'info',
                            `Welcome back, ${firstName}!`
                          );
                        } else {
                          this.snackbarService.open('info', message);
                        }
                      }
                    }
                  );
                })
                .catch((error) => {
                  // eslint-disable-next-line no-console
                  console.log(error);
                });
            });
        }
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.log(error);
        this.snackbarService.openPermanent(
          'error',
          'Username or Password Incorrect'
        );
      }
    );
  }

  loginSchool(
    userDetails: UserLoginDTO,
    message: string,
    signup?: boolean
  ): void {
    this.currentSchool$.pipe(first()).subscribe(
      (currentSchool) => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (currentSchool?._id) {
          this.authStoreService
            .login(userDetails, currentSchool._id)
            .subscribe(() => {
              this.router
                .navigateByUrl(
                  `/${currentSchool.name
                    .replace(/ /gu, '-')
                    .toLowerCase()}/home`
                )
                .then(() => {
                  this.currentUserSubscription = this.currentUser$.subscribe(
                    (currentUser) => {
                      if (currentUser) {
                        if (!(signup ?? false)) {
                          this.snackbarService.open(
                            'info',
                            `Welcome back, ${currentSchool.name}!`
                          );
                        } else {
                          this.snackbarService.open('info', message);
                        }
                      }
                    }
                  );
                })
                .catch((error) => {
                  // eslint-disable-next-line no-console
                  console.log(error);
                });
            });
        }
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.log(error);
        this.snackbarService.openPermanent(
          'error',
          'Username or Password Incorrect'
        );
      }
    );
  }

  changeBackgroundImage(backgroundImage: BackgroundImageDTO): void {
    if (this.selectedBackgroundImage) {
      // this.selectedBackgroundImage.name = `../../../assets/${name}`;
      this.selectedBackgroundImage = backgroundImage;
    }
    // this.snackbarService.openPermanent(
    //   'info',
    //   "Can't decide on a good background image? Don't worry, you can always change it later!"
    // );
  }

  deleteSchoolClick(id?: string | null): void {
    if (id !== undefined && id !== null) {
      this.schoolService.delete(id).subscribe({
        next: () => {
          this.snackbarService.open('info', 'School successfully deleted');
        },
        error: (error: Error) => {
          this.error = error;
          this.snackbarService.openPermanent('error', error.message);
        },
      });
    }
  }

  deleteAdminUserClick(id?: string | null): void {
    if (id !== undefined && id !== null) {
      this.userService.delete(id).subscribe({
        next: () => {
          this.snackbarService.open('info', 'School successfully deleted');
        },
        error: (error: Error) => {
          this.error = error;
          this.snackbarService.openPermanent('error', error.message);
        },
      });
    }
  }
}
