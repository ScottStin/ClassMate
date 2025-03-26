import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogModule } from 'src/app/components/confirm-dialog/confirm-dialog.module';
import { MessengerDialogFullModule } from 'src/app/pages/messenger-dialog-full/messenger-dialog-full.module';

import { NotificationsDialogModule } from '../notifications-dialog/notifications-dialog.module';
import { HeaderCardComponent } from './header-card.component';

@NgModule({
  declarations: [HeaderCardComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    NotificationsDialogModule,
    MatMenuModule,
    MatBadgeModule,
    MatMenuModule,
    MessengerDialogFullModule,
  ],
  exports: [HeaderCardComponent],
})
export class HeaderCardModule {}
