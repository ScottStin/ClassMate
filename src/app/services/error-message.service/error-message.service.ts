/* eslint-disable no-console */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  /**
   * Handles HTTP response errors and generate an appropriate message when needed
   * Also logs the error for developers in development
   *
   * @param error - The HTTP Response Error
   * @returns A new generic Error we can throw
   */
  handleHttpError(error: HttpErrorResponse): Error {
    if (!environment.production) {
      console.log(error);
    }
    return new Error(error.message);
  }

  /**
   * Handles any error type of error and handle it accordingly
   * Also logs the error for developers in development
   *
   * @param error - The Error we need to handle
   * @param message - The message to throw with
   * @returns A new generic Error we can throw
   */
  handleGenericError(error: unknown, message: string): Error {
    if (!environment.production) {
      console.log(error);
    }
    return new Error(message);
  }
}
