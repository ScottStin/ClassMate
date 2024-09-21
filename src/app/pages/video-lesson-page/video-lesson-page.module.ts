import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { VideoLessonPageComponent } from './video-lesson-page.component';
import { VideoLessonPageRoutingModule } from './video-lesson-page-routing.module';
import { VideoLessonViewModule } from './video-lesson-view/video-lesson-view.module';

@NgModule({
  declarations: [VideoLessonPageComponent],
  imports: [CommonModule, VideoLessonPageRoutingModule, VideoLessonViewModule],
})
export class VideoLessonPageModule {}
