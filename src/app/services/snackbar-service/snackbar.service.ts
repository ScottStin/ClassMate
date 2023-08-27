import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  defaultConfigs: MatSnackBarConfig;

  constructor(private readonly snackbar: MatSnackBar) {
    this.defaultConfigs = {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    };
  }

  /**
   * Opens the snackbar.
   * Will override any snackbar that is currently opened.
   *
   * @param type - The type of snackbar
   * @param message - The mesage to display
   * @param buttonText - The text for the button
   * @param configs - Additional configs for the snack bar
   *
   * @returns A reference of the snackbar that opened
   */
  open(
    type: SnackbarType,
    message: string,
    buttonText = 'dismiss',
    configs: MatSnackBarConfig = {}
  ): MatSnackBarRef<TextOnlySnackBar> {
    const config = {
      ...this.defaultConfigs,
      ...configs,
    };
    let button = buttonText;

    // Add snackbar css class if it's not default
    if (type !== 'default') {
      config.panelClass = `snackbar-${type}`;
    }

    // Change text to uppercase for button
    if (button) {
      button = button.toLocaleUpperCase();
    }

    return this.snackbar.open(message, button, config);
  }

  /**
   * Opens a permanent snackbar.
   * Will override any snackbar that is currently opened.
   *
   * @param type - The type of snackbar
   * @param message - The mesage to display
   * @param buttonText - The text for the button
   * @param configs - Additional configs for the snack bar
   *
   * @returns A reference of the snackbar that opened
   */
  openPermanent(
    type: SnackbarType,
    message: string,
    buttonText = 'dismiss',
    configs: MatSnackBarConfig = {}
  ): MatSnackBarRef<TextOnlySnackBar> {
    const config = {
      ...this.defaultConfigs,
      ...configs,
      duration: undefined,
    };
    return this.open(type, message, buttonText, config);
  }

  /**
   * Closes all snackbars
   */
  close(): void {
    this.snackbar.dismiss();
  }
}

export type SnackbarType = 'default' | 'info' | 'success' | 'warn' | 'error';
