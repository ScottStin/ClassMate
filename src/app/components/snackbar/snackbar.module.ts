import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SnackbarComponent } from './snackbar.component';

@NgModule({
  declarations: [SnackbarComponent],
  imports: [CommonModule, MatButtonModule, MatIconModule],
  exports: [SnackbarComponent],
})
export class SnackbarModule {}
