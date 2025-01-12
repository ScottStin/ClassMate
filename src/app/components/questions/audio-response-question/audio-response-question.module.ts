import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AudioResponseQuestionComponent } from './audio-response-question.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatProgressBarModule} from '@angular/material/progress-bar';
@NgModule({
  declarations: [AudioResponseQuestionComponent],
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressBarModule],
  exports: [AudioResponseQuestionComponent],
})
export class AudioResponseQuestionModule {}
