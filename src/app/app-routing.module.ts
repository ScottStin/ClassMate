import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { SchoolService } from './services/school-service/school.service';
import { SchoolDTO } from './shared/models/school.model';

export const schools = [
  'test123',
  'YouSTUDY',
  'dfgdgdgdgdgd',
  'dfgdgdgdgdgd',
  'dfgdgdgdgdgd',
  'lalalalal',
  'lalalalal2',
  'lalalalal3',
  'new1',
  'fdsfdsfdsfsdf',
  'YouSTUDY2',
  'English-Solutions',
  'test-new-1',
  'test-new-school-6',
  'international-house', // admin@ih.com Test123?
];

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
  currentSchoolSubscription: Subscription | null;
  currentSchool$: Observable<SchoolDTO | null>;

  constructor(
    private readonly router: RouterModule,
    schoolService: SchoolService
  ) {
    this.currentSchool$ = schoolService.currentSchool$;
    this.addSchools();
  }

  addSchools(): void {
    for (const school of schools) {
      routes.push(
        {
          path: `${school.toLocaleLowerCase()}/welcome`,
          // data: { school },
          loadChildren: async () =>
            (await import('./pages/welcome-page/welcome-page.module'))
              .WelcomePageModule,
        },
        {
          path: `${school.toLocaleLowerCase()}/student`,
          // data: { school },
          loadChildren: async () =>
            (await import('./pages/login-page/login-page.module'))
              .LoginPageModule,
        },
        {
          path: `${school.toLocaleLowerCase()}/teacher`,
          // data: { school },
          loadChildren: async () =>
            (await import('./pages/login-page/login-page.module'))
              .LoginPageModule,
        },
        {
          path: `${school.toLocaleLowerCase()}/school`,
          // data: { school },
          loadChildren: async () =>
            (await import('./pages/login-page/login-page.module'))
              .LoginPageModule,
        },
        {
          path: 'school',
          // data: { school },
          loadChildren: async () =>
            (await import('./pages/login-page/login-page.module'))
              .LoginPageModule,
        },
        {
          path: `${school.toLocaleLowerCase()}`,
          // data: { school },
          loadChildren: async () =>
            (await import('./pages/main-page/main-page.module')).MainPageModule,
        },
        {
          path: `${school.toLocaleLowerCase()}`,
          // data: { school },
          loadChildren: async () =>
            (await import('./pages/main-page/main-page.module')).MainPageModule,
        }
      );
    }
    routes.push({
      path: '**',
      redirectTo: `school/signup`,
    });

    this.addWildCardRoutes();
  }

  addWildCardRoutes(): void {
    this.currentSchoolSubscription = this.currentSchool$.subscribe(
      (currentSchool) => {
        if (currentSchool) {
          // remove existing wildcard routes:
          const index = routes.findIndex((route) => route.path === '**');
          if (index !== -1) {
            routes.splice(index, 1);
          }

          // add new wildcard route with current school name:
          routes.push({
            path: '**',
            redirectTo: `${currentSchool.name
              .replace(/ /gu, '-')
              .toLowerCase()}/home`,
          });
        }
        // this.router.resetConfig(routes);
        if (this.currentSchoolSubscription) {
          this.currentSchoolSubscription.unsubscribe();
        }
      }
    );
  }
}
