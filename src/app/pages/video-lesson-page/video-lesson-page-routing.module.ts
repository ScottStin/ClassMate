/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { VideoLessonPageComponent } from './video-lesson-page.component';



const routes: Routes = [
  {
    path: '',
    component: VideoLessonPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VideoLessonPageRoutingModule {}