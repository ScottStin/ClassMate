import { Component, Inject, inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { QueuedSnackbar } from 'src/app/services/snackbar-service/snackbar.service';

@Component({
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})
export class SnackbarComponent {
  snackBarRef = inject(MatSnackBarRef);

  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data: QueuedSnackbar
  ) {}

  dismissWithAction(): void {
    this.snackBarRef.dismissWithAction();
  }

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}
