import { NgModule } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, Routes } from '@angular/router';

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
];

const currentSchoolString = localStorage.getItem('current_school');
const currentSchool = (
  currentSchoolString !== null ? JSON.parse(currentSchoolString) : undefined
) as SchoolDTO | undefined;

const routes: Routes = [
  // Wildcard route for unknown paths
  // {
  //   path: '**',
  //   redirectTo: currentSchool ? `${currentSchool}/welcome` : '', // redirect to homepage
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(private readonly router: RouterModule) {
    this.addSchools();
    console.log(currentSchool);
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
        }
      );
    }
  }

  // this.router.resetConfig(routes);
}
