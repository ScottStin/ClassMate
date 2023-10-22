import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  dialogTitle: string | null;
  dialogMessage: string;
  okLabel: string;
  cancelLabel: string;
  routerLink: string | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private readonly router: Router
  ) {
    this.dialogTitle = data.title ?? null;
    this.dialogMessage = data.message;
    this.okLabel = data.okLabel ?? 'OK';
    this.cancelLabel = data.cancelLabel ?? 'Cancel';
    this.routerLink = data.routerLink ?? undefined;
  }

  async confirmClick(): Promise<void> {
    if (this.routerLink !== undefined) {
      await this.router.navigateByUrl(this.routerLink);
    }
  }
}

export interface ConfirmDialogData {
  title?: string;
  message: string;
  okLabel?: string;
  cancelLabel?: string;
  routerLink?: string;
}
