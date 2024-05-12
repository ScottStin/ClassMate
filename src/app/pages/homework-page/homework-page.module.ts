import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfirmDialogModule } from 'src/app/components/confirm-dialog/confirm-dialog.module';
import { CreateHomeworkDialogModule } from 'src/app/components/create-homework-dialog/create-homework-dialog.module';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';

import { HomeworkCardModule } from './homework-card/homework-card.module';
import { HomeworkPageComponent } from './homework-page.component';
import { HomePageRoutingModule } from './homework-page-routing.module';
import { HomeworkTableModule } from './homework-table/homework-table.module';

@NgModule({
  declarations: [HomeworkPageComponent],
  imports: [
    CommonModule,
    HeaderCardModule,
    ConfirmDialogModule,
    MatProgressBarModule,
    MatTabsModule,
    HomePageRoutingModule,
    CreateHomeworkDialogModule,
    HomeworkTableModule,
    HomeworkCardModule,
    MatSelectModule,
  ],
  exports: [HomeworkPageComponent],
})
export class HomeworkPageModule {}
