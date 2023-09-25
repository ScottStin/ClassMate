import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { LessonCardModule } from 'src/app/components/lesson-card/lesson-card.module';

import { LessonPageComponent } from './lesson-page.component';
import { LessonPageRoutingModule } from './lesson-page-routing.module';

@NgModule({
  declarations: [LessonPageComponent],
  imports: [
    MatButtonModule,
    CommonModule,
    LessonPageRoutingModule,
    MatTabsModule,
    LessonCardModule,
    MatIconModule,
  ],
  exports: [LessonPageComponent],
})
export class LessonPageModule {}
