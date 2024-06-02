import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { HomeworkFeedbackDialogModule } from 'src/app/components/homework-feedback-dialog/homework-feedback-dialog.module';

import { HomeworkCardComponent } from './homework-card.component';

@NgModule({
  declarations: [HomeworkCardComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    MatButtonModule,
    HomeworkFeedbackDialogModule,
    MatChipsModule,
  ],
  exports: [HomeworkCardComponent],
})
export class HomeworkCardModule {}
