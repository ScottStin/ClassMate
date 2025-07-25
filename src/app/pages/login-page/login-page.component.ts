import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, finalize, first, forkJoin, Observable } from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { TempStylesService } from 'src/app/services/temp-styles-service/temp-styles-service.service';
import { UserService } from 'src/app/services/user-service/user.service';
import {
  BackgroundImageDTO,
  backgroundImages,
} from 'src/app/shared/background-images';
import { defaultStyles } from 'src/app/shared/default-styles';
import { CreateSchoolDTO, SchoolDTO } from 'src/app/shared/models/school.model';
import {
  CreateUserDTO,
  UserDTO,
  UserLoginDTO,
} from 'src/app/shared/models/user.model';

@UntilDestroy()
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  error: Error;
  isFlipped = false;
  photoSrcPrimary = '';
  photoSrcSecondary = '';
  schools$: Observable<SchoolDTO[]>;
  users$: Observable<UserDTO[]>;
  userType: 'student' | 'teacher' | 'school' | '' = '';
  currentSchool$: Observable<SchoolDTO | null>;
  currentUser$: Observable<UserDTO | null>;
  pageLoading = true;

  backgroundImages = backgroundImages;
  defaultStyles = defaultStyles;
  selectedBackgroundImage: BackgroundImageDTO =
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
    public readonly tempStyleService: TempStylesService,
    private readonly route: ActivatedRoute
  ) {
    this.getRouterDetails();
  }

  getRouterDetails(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        untilDestroyed(this)
      )
      .subscribe(() => {
        const urlAddress: string[] = this.router.url.split('/');

        if (
          [urlAddress[2].toLowerCase(), urlAddress[1].toLowerCase()].includes(
            'student'
          )
        ) {
          this.userType = 'student';
          this.photoSrcPrimary = '../../../assets/Student.png';
        } else if (
          [urlAddress[2].toLowerCase(), urlAddress[1].toLowerCase()].includes(
            'teacher'
          )
        ) {
          this.userType = 'teacher';
          this.photoSrcPrimary = '../../../assets/Teacher.png';
        } else if (
          [urlAddress[2].toLowerCase(), urlAddress[1].toLowerCase()].includes(
            'school'
          )
        ) {
          this.userType = 'school';
          this.photoSrcPrimary = '../../../assets/School.png';
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

        setTimeout(() => {
          this.getCurrentSchoolDetails();
        });
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.currentSchool$) {
      this.snackbarService.queueBar('error', `Error loading current school.`, {
        label: `retry`,
        registerAction: (onAction: Observable<void>) =>
          onAction.pipe(untilDestroyed(this)).subscribe(() => {
            this.getCurrentSchoolDetails();
          }),
      });
      return;
    }

    this.currentSchool$
      .pipe(untilDestroyed(this))
      .subscribe((currentSchool) => {
        if (currentSchool) {
          const backgroundImage = currentSchool.backgroundImage as
            | BackgroundImageDTO
            | undefined;

          const primaryButtonBackgroundColor =
            currentSchool.primaryButtonBackgroundColor as string | undefined;

          const primaryButtonTextColor =
            currentSchool.primaryButtonTextColor as string | undefined;

          this.photoSrcPrimary = currentSchool.logoPrimary.url;
          this.photoSrcSecondary = currentSchool.logoSecondary.url;

          if (backgroundImage !== undefined) {
            this.selectedBackgroundImage = backgroundImage;
          } else {
            this.selectedBackgroundImage =
              this.defaultStyles.selectedBackgroundImage;
          }

          if (primaryButtonBackgroundColor !== undefined) {
            this.primaryButtonBackgroundColor = primaryButtonBackgroundColor;
          }

          if (primaryButtonTextColor !== undefined) {
            this.primaryButtonTextColor = primaryButtonTextColor;
          }
        }
      });
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
    this.pageLoading = true;
    forkJoin([this.schoolService.getAll(), this.userService.getAll()])
      .pipe(
        first(),
        finalize(() => {
          this.pageLoading = false;
        })
      )
      .subscribe({
        error: (error: Error) => {
          this.pageLoading = false;
          this.snackbarService.queueBar(
            'error',
            `Error: Failed to load page: ${error.message}`,
            {
              label: `retry`,
              registerAction: (onAction: Observable<void>) =>
                onAction.pipe(untilDestroyed(this)).subscribe(() => {
                  this.loadPageData();
                }),
            }
          );
        },
      });
  }

  async signup(user: CreateUserDTO): Promise<void> {
    this.pageLoading = true;
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
        this.snackbarService.queueBar('error', 'Unable to sign up.');
        this.pageLoading = false;
      }
    } catch (error) {
      this.pageLoading = false;
      this.snackbarService.queueBar('error', 'Unable to sign up.');
    }
  }

  signupSchool(school: CreateSchoolDTO): void {
    this.pageLoading = true;

    this.schoolService.create(school).subscribe({
      next: (res) => {
        this.snackbarService.queueBar(
          'info',
          `School successfully created! Navigate to www.${res.name}/welcome to get started.`
        );
        this.pageLoading = false;
      },
      error: (error: Error) => {
        this.error = error;
        this.snackbarService.queueBar('error', error.message);
      },
    });
  }

  login(
    userDetails: UserLoginDTO,
    message: string,
    signup?: boolean,
    route?: string
  ): void {
    this.pageLoading = true;
    this.currentSchool$.pipe(first()).subscribe(
      (currentSchool) => {
        if (currentSchool?._id) {
          this.authStoreService
            .login(userDetails, currentSchool._id)
            .pipe(
              finalize(() => {
                this.pageLoading = false;
              })
            )
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
                  this.currentUser$
                    .pipe(untilDestroyed(this))
                    .subscribe((currentUser) => {
                      if (currentUser) {
                        const firstName = currentUser.name.split(' ')[0]; // todo - move firstname generator to auth.store.service
                        if (!(signup ?? false)) {
                          this.snackbarService.queueBar(
                            'info',
                            `Welcome back, ${firstName}!`
                          );
                        } else {
                          this.snackbarService.queueBar('info', message);
                        }
                      }
                    });
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
        this.snackbarService.queueBar(
          'error',
          'Username or Password Incorrect.'
        );
      }
    );
  }

  loginSchool(
    userDetails: UserLoginDTO,
    message: string,
    signup?: boolean
  ): void {
    this.pageLoading = true;
    this.currentSchool$.pipe(first()).subscribe(
      (currentSchool) => {
        if (currentSchool?._id) {
          this.authStoreService
            .login(userDetails, currentSchool._id)
            .pipe(
              finalize(() => {
                this.pageLoading = false;
              })
            )
            .subscribe(() => {
              this.router
                .navigateByUrl(
                  `/${currentSchool.name
                    .replace(/ /gu, '-')
                    .toLowerCase()}/home`
                )
                .then(() => {
                  this.currentUser$
                    .pipe(untilDestroyed(this))
                    .subscribe((currentUser) => {
                      if (currentUser) {
                        if (!(signup ?? false)) {
                          this.snackbarService.queueBar(
                            'info',
                            `Welcome back, ${currentSchool.name}!`
                          );
                        } else {
                          this.snackbarService.queueBar('info', message);
                        }
                      }
                    });
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
        this.snackbarService.queueBar(
          'error',
          'Username or Password Incorrect.'
        );
      }
    );
  }

  changeBackgroundImage(backgroundImage: BackgroundImageDTO): void {
    this.selectedBackgroundImage = backgroundImage;
  }

  deleteSchoolClick(id?: string | null): void {
    if (id !== undefined && id !== null) {
      this.schoolService.delete(id).subscribe({
        next: () => {
          this.snackbarService.queueBar('info', 'School successfully deleted.');
        },
        error: (error: Error) => {
          this.error = error;
          this.snackbarService.queueBar('error', error.message);
        },
      });
    }
  }

  deleteAdminUserClick(id?: string | null): void {
    if (id !== undefined && id !== null) {
      this.userService.delete(id).subscribe({
        next: () => {
          this.snackbarService.queueBar('info', 'School successfully deleted.');
        },
        error: (error: Error) => {
          this.error = error;
          this.snackbarService.queueBar('error', error.message);
        },
      });
    }
  }
}
