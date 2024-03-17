/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { schools } from 'src/app/app-routing.module';
import { AuthLoggedInGuard } from 'src/app/core/guards/auth-logged-in.guard';
import { SchoolDTO } from 'src/app/shared/models/school.model';

import { MainPageComponent } from './main-page.component';

const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
    children: [
      {
        path: 'home',
        loadChildren: async () =>
          (await import('../home-page/home-page.module')).HomePageModule,
      },
      {
        path: 'lessons',
        canActivate: [AuthLoggedInGuard],
        loadChildren: async () =>
          (await import('../lesson-page/lesson-page.module')).LessonPageModule,
      },
      {
        path: 'users',
        canActivate: [AuthLoggedInGuard],
        loadChildren: async () =>
          (await import('../user-page/user-page.module')).UserPageModule,
      },
      {
        path: 'exams',
        canActivate: [AuthLoggedInGuard],
        loadChildren: async () =>
          (await import('../exam-page/exam-page.module')).ExamPageModule,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {
  // currentSchool: SchoolDTO | undefined = undefined;

  // constructor() {
    // const currentSchoolString: string | null =
    //   localStorage.getItem('current_school');
    // this.currentSchool = (
    //   currentSchoolString !== null ? JSON.parse(currentSchoolString) : undefined
    // ) as SchoolDTO | undefined;
    // this.addSchoolRoute();
  // }

  // addSchoolRoute(): void {
  //   console.log(schools);
  //   if (this.currentSchool !== undefined) {
  //     // for (const route of children) {

  //     // if (route.path !== undefined) {
  //       for (const school of schools) {
  //         routes.push(
  //           {
  //             path: `${school}/home`,
  //             loadChildren: async () =>
  //               (await import('../home-page/home-page.module')).HomePageModule,
  //           },
  //           {
  //             path: `${school}/lessons`,
  //             canActivate: [AuthLoggedInGuard],
  //             loadChildren: async () =>
  //               (await import('../lesson-page/lesson-page.module'))
  //                 .LessonPageModule,
  //           },
  //           {
  //             path: `${school}/users`,
  //             canActivate: [AuthLoggedInGuard],
  //             loadChildren: async () =>
  //               (await import('../user-page/user-page.module')).UserPageModule,
  //           },
  //           {
  //             path: `${school}/exams`,
  //             canActivate: [AuthLoggedInGuard],
  //             loadChildren: async () =>
  //               (await import('../exam-page/exam-page.module')).ExamPageModule,
  //           }
  //         );
  //       }
  //     // }
  //     // }
  //   }
    // console.log(routes);
  // }
}
