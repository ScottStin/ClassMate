import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { first, Observable, Subscription } from 'rxjs';

import { schools } from './app-routing.module';
import { AuthStoreService } from './services/auth-store-service/auth-store.service';
import { RouterService } from './services/router-service/router.service';
import { SchoolService } from './services/school-service/school.service';
import { SnackbarService } from './services/snackbar-service/snackbar.service';
import { SchoolDTO } from './shared/models/school.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  title = 'ClassMate';

  private readonly routerSubscription: Subscription | undefined;
  schools$: Observable<SchoolDTO[]>;
  currentSchool$: Observable<SchoolDTO | null>;
  schools = schools;

  constructor(
    private readonly schoolService: SchoolService,
    private readonly authStoreService: AuthStoreService,
    private readonly routerService: RouterService,
    private readonly snackbarService: SnackbarService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.routerSubscription = this.router.events.subscribe(() => {
      // --- get school from local storage:
      const currentSchoolString = localStorage.getItem('current_school');
      let currentSchoolName: string | undefined = '';
      if (currentSchoolString !== null) {
        currentSchoolName = (
          JSON.parse(currentSchoolString) as SchoolDTO | undefined
        )?.name
          .replace(/ /gu, '-')
          .toLocaleLowerCase();
      }

      // --- check if current school has changed:
      setTimeout(() => {
        const schoolUrlName = this.router.url.split('/')[1].toLowerCase();
        if (schoolUrlName && currentSchoolName !== schoolUrlName) {
          if (
            schools
              .map((obj) => obj.toLocaleLowerCase())
              .includes(schoolUrlName)
          ) {
            this.getSchools(schoolUrlName);
          }
          // else {
          //   console.log('hit2');
          //   this.router.navigateByUrl('school/signup');
          // }
        }
      });
    });
  }

  getSchools(schoolUrlName: string): void {
    this.schools$ = this.schoolService.schools$;
    this.schoolService.getAll().subscribe({
      next: (res) => {
        // eslint-disable-next-line no-console
        console.log('Attempting to change schools...');

        // --- check if school from url exists
        const currentSchool = res.find(
          (obj) => obj.name.replace(/ /gu, '-').toLowerCase() === schoolUrlName
        );

        // --- if current school from url exists, change current schools
        if (currentSchool) {
          // eslint-disable-next-line no-console
          console.log('New school from URL successfully found...');

          this.schoolService.updateCurrentSchool(currentSchool);
          this.authStoreService.logout();
          const schoolName = currentSchool.name
            .replace(/ /gu, '-')
            .toLowerCase();
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          this.router.navigateByUrl(
            `${schoolName}/welcome`
          ) as Promise<boolean>;

          // eslint-disable-next-line no-console
          console.log('School successfully changed!');
        }
      },
      error: () => {
        const snackbar = this.snackbarService.openPermanent(
          'error',
          'Error: Failed to load site.',
          'retry'
        );
        snackbar
          .onAction()
          .pipe(first())
          .subscribe(() => {
            this.getSchools(schoolUrlName);
          });
      },
    });
  }

  addSchoolRoutes(schoolName: string): void {
    const routes: Routes = [];
    for (const school of this.schools) {
      routes.push(
        {
          path: `${school.toLocaleLowerCase()}/welcome`,
          loadChildren: async () =>
            (await import('./pages/welcome-page/welcome-page.module'))
              .WelcomePageModule,
        },
        {
          path: `${school.toLocaleLowerCase()}/student`,
          loadChildren: async () =>
            (await import('./pages/login-page/login-page.module'))
              .LoginPageModule,
        },
        {
          path: `${school.toLocaleLowerCase()}/teacher`,
          loadChildren: async () =>
            (await import('./pages/login-page/login-page.module'))
              .LoginPageModule,
        },
        {
          path: `${school.toLocaleLowerCase()}/school`,
          loadChildren: async () =>
            (await import('./pages/login-page/login-page.module'))
              .LoginPageModule,
        },
        {
          path: 'school',
          loadChildren: async () =>
            (await import('./pages/login-page/login-page.module'))
              .LoginPageModule,
        },
        {
          path: `${school.toLocaleLowerCase()}`,
          loadChildren: async () =>
            (await import('./pages/main-page/main-page.module')).MainPageModule,
        }
      );
    }
    routes.push({
      path: '**',
      redirectTo: `${schoolName}/home`,
    });
    this.routerService.initialize(routes);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
