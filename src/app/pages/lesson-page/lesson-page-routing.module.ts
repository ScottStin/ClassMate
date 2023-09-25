/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LessonPageComponent } from './lesson-page.component';

const routes: Routes = [
  {
    path: '',
    component: LessonPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LessonPageRoutingModule {}
