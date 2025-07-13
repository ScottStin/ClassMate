import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from 'src/app/app-routing.module';

import { VideoLessonViewComponent } from './video-lesson-view.component';

@NgModule({
  declarations: [VideoLessonViewComponent],
  imports: [CommonModule, AppRoutingModule],
  exports: [VideoLessonViewComponent],
})
export class VideoLessonViewModule {}
