import { Component, Input, OnChanges } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css'],
})
export class ErrorMessageComponent implements OnChanges {
  @Input()
  control!: ValidationErrors | null;

  errors: string[] = [];
  errorMessages: string[] = [];

  ngOnChanges(): void {
    // Reset error messages
    this.errorMessages = [];

    // Gather all errors
    if (this.control !== null) {
      this.errors = Object.keys(this.control);
      this.errors.forEach((error) => {
        this.errorMessages.push(this.getErrorMessage(this.control, error));
      });
    }
  }

  /**
   * Generates the error messages
   *
   * @param error - The object containing all the errors
   * @param key - The type of error
   * @returns The error message
   */
  getErrorMessage(error: ValidationErrors | null, key: string): string {
    switch (key) {
      case 'required':
        return 'Required';

      case 'passwordLength':
        return 'Password must be between 6 to 14 characters in length';

      case 'passwordCapitalLetter':
        return 'Password must contain at least 1 capital letter';

      case 'passwordLowercaseLetter':
        return 'Password must contain at least 1 capital letter';

      case 'passwordSpecialCharacter':
        return 'Password must contain at least 1 special character (e.g. @?$%^&!?)';

      case 'passwordDigit':
        return 'Password must contain at least 1 number (0-9)';

      case 'passwordMatch':
        return 'Passwords must match';

      case 'invalidEmail':
        return 'Must be a valid email address';

      case 'existingEmailLogin':
        return 'A user with this email already exists. Click below to login instead';

      case 'schoolNotFound':
        return 'School not found';

      case 'existingNamelLogin':
        return 'A user with this name already exists. Click below to login instead';

      case 'existingEmail':
        return 'A user with this email already exists.';

      case 'tooFewWords':
        return 'Too few words';

      case 'tooManyWords':
        return 'Too many words';

      case 'tooLong':
        return 'Too long';

      case 'tooShort':
        return 'Too short';

      case 'oldDate':
        return 'Date mufst not be in the past';

      case 'lessThanOne':
        return 'Number must be greater than zero';

      case 'invalidUrl':
        return 'Please enter a valid URL';

      default:
        return 'Unknown error';
    }
  }
}
