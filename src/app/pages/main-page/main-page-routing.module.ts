/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
        loadChildren: async () =>
              (await import('../lesson-page/lesson-page.module')).LessonPageModule,
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
