import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { first, Observable } from 'rxjs';
import { SnackbarComponent } from 'src/app/components/snackbar/snackbar.component';

const SNACKBAR_CONFIG: MatSnackBarConfig = {
  horizontalPosition: 'center',
  verticalPosition: 'bottom',
  panelClass: `nlt-snackbar-default`,
};

const DEFAULT_DURATION = 2500;
const LONG_DURATION = 10000;

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private readonly snackbarQueue: QueuedSnackbar[] = [];
  private snackbarCurrentlyOpened = false;

  constructor(private readonly snackbar: MatSnackBar) {}

  queueBar(type: SnackbarType, message: string, action?: SnackbarAction): void {
    this.snackbarQueue.push({ type, message, action });
    this.processQueue();
  }

  private processQueue(): void {
    if (this.snackbarCurrentlyOpened) {
      return;
    }

    const nextSnackbar = this.snackbarQueue.shift();
    if (!nextSnackbar) {
      return;
    }

    this.snackbarCurrentlyOpened = true;
    const snackbarRef = this.snackbar.openFromComponent(SnackbarComponent, {
      ...SNACKBAR_CONFIG,
      duration: ['error', 'warn'].includes(nextSnackbar.type)
        ? LONG_DURATION
        : DEFAULT_DURATION,
      data: nextSnackbar,
    });

    snackbarRef.afterDismissed().subscribe(() => {
      this.snackbarCurrentlyOpened = false;
      this.processQueue();
    });

    if (nextSnackbar.action) {
      nextSnackbar.action.registerAction(snackbarRef.onAction().pipe(first()));
    }
  }
}

export type SnackbarType = 'info' | 'success' | 'warn' | 'error';
export interface SnackbarAction {
  label: string;
  registerAction: (onAction: Observable<void>) => void;
}

export interface QueuedSnackbar {
  type: SnackbarType;
  message: string;
  action?: SnackbarAction;
}
