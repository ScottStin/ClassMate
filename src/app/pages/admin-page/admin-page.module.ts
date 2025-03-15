import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfirmDialogModule } from 'src/app/components/confirm-dialog/confirm-dialog.module';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';
import { LessonCardModule } from 'src/app/pages/lesson-page/lesson-card/lesson-card.module';

import { AdminPageComponent } from './admin-page.component';
import { AdminPageRoutingModule } from './admin-page-routing.module';
import { AdminViewModule } from './admin-view/admin-view.module';

@NgModule({
  declarations: [AdminPageComponent],
  imports: [
    CommonModule,
    AdminPageRoutingModule,
    LessonCardModule,
    MatProgressBarModule,
    HeaderCardModule,
    ConfirmDialogModule,
    AdminViewModule,
  ],
  exports: [AdminPageComponent],
})
export class AdminPageModule {}
