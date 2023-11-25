import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ExamTableModule } from 'src/app/components/exam-table/exam-table.module';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';

import { ExamPageComponent } from './exam-page.component';
import { ExamPageRoutingModule } from './exam-page-routing.module';

@NgModule({
  declarations: [ExamPageComponent],
  imports: [
    CommonModule,
    ExamPageRoutingModule,
    HeaderCardModule,
    MatProgressBarModule,
    MatTabsModule,
    ExamTableModule,
  ],
  exports: [ExamPageComponent],
})
export class ExamPageModule {}
