import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { LessonCardModule } from 'src/app/components/lesson-card/lesson-card.module';

import { HomePageComponent } from './home-page.component';
import { HomePageRoutingModule } from './home-page-routing.module';

@NgModule({
  declarations: [HomePageComponent],
  imports: [
    CommonModule,
    HomePageRoutingModule,
    MatTabsModule,
    LessonCardModule,
  ],
  exports: [HomePageComponent],
})
export class HomePageModule {}
