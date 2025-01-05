import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AudioResponseQuestionComponent } from './audio-response-question.component';

@NgModule({
  declarations: [AudioResponseQuestionComponent],
  imports: [CommonModule, MatButtonModule, MatIconModule],
  exports: [AudioResponseQuestionComponent],
})
export class AudioResponseQuestionModule {}
