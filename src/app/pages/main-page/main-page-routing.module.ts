/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLoggedInGuard } from 'src/app/core/guards/auth-logged-in.guard';

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
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
