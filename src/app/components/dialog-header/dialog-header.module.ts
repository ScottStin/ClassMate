import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DialogHeaderComponent } from './dialog-header.component';

@NgModule({
  declarations: [DialogHeaderComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDialogModule,
  ],
  exports: [DialogHeaderComponent],
})
export class DialogHeaderModule {}
