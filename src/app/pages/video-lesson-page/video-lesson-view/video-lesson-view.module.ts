import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { VideoLessonViewComponent } from './video-lesson-view.component';

@NgModule({
  declarations: [VideoLessonViewComponent],
  imports: [CommonModule],
  exports: [VideoLessonViewComponent],
})
export class VideoLessonViewModule {}
