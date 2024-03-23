import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
  routerLink: string | undefined | null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private readonly router: Router,
    private readonly dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {
    this.dialogTitle = data.title ?? null;
    this.dialogMessage = data.message;
    this.okLabel = data.okLabel ?? 'OK';
    this.cancelLabel = data.cancelLabel ?? 'Cancel';
    this.routerLink = data.routerLink ?? undefined;
  }

  async confirmClick(): Promise<void> {
    console.log('test1');
    console.log(this.routerLink);
    if (
      this.routerLink !== undefined &&
      this.routerLink !== '' &&
      this.routerLink !== null
    ) {
      await this.router.navigateByUrl(this.routerLink);
    }
    this.dialogRef.close(true);
  }

  closeDialog(): void {
    console.log('test2');
    console.log(this.routerLink);
    this.dialogRef.close(false);
  }
}

export interface ConfirmDialogData {
  title?: string;
  message: string;
  okLabel?: string;
  cancelLabel?: string;
  routerLink?: string;
}
