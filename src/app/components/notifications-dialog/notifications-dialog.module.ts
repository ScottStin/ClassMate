import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NotificationsDialogComponent } from './notifications-dialog.component';

@NgModule({
  declarations: [NotificationsDialogComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatToolbarModule,
    MatDialogModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatTooltipModule,
  ],
  exports: [NotificationsDialogComponent],
})
export class NotificationsDialogModule {}
