import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { countryList } from 'src/app/shared/country-list';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.css'],
})
export class LoginCardComponent implements OnInit, OnChanges {
  @Input() title!: string;
  @Input() users!: UserDTO[] | null;
  @Input() usersLoading!: boolean;
  @Input() userType!: string;
  @Input() isFlipped!: boolean;
  @Input() photoSrc!: string;
  @Output() cardFlipped = new EventEmitter<boolean>();
  @Output() signup = new EventEmitter<UserDTO>();
  countryList = countryList;
  hidePassword = true;

  loginForm!: FormGroup<{
    nameInput: FormControl<string>;
    emailInput: FormControl<string>;
    countryInput: FormControl<string>;
    personalStatement: FormControl<string>;
    passwordInput: FormControl<string>;
    passwordMatchInput: FormControl<string>;
  }>;

  formPopulated = new Subject<boolean>();

  ngOnInit(): void {
    this.users?.map((user: UserDTO) => user.email);
    this.populateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('title' in changes) {
      this.populateForm();
    }
  }

  populateForm(): void {
    this.loginForm = new FormGroup({
      nameInput: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      emailInput: new FormControl('', {
        validators: [Validators.required, this.emailValidator()],
        nonNullable: true,
      }),
      countryInput: new FormControl('', {
        validators: [],
        nonNullable: true,
      }),
      personalStatement: new FormControl('', {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        validators: [this.wordCountValidator(10, 200)],
        nonNullable: true,
      }),
      passwordInput: new FormControl('', {
        validators: [this.passwordValidator()],
        nonNullable: true,
      }),
      passwordMatchInput: new FormControl('', {
        validators: [this.passwordMatchValidator()],
        nonNullable: true,
      }),
    });
    this.formPopulated.next(true);
  }

  toggleCardFlip(): void {
    this.isFlipped = !this.isFlipped;
    this.cardFlipped.emit(this.isFlipped);
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const value = control.value as string;
      if (this.title === 'signup') {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (value.length < 6 || value.length > 14) {
          return { passwordLength: true }; // Check length
        } else if (!/[A-Z]/u.test(value)) {
          return { passwordCapitalLetter: true }; // Check for at least one capital letter
        } else if (!/[a-z]/u.test(value)) {
          return { passwordLowercaseLetter: true }; // Check for at least one lowercase letter
        } else if (!/[!@#$%^&*(),.?":{}|<>]/u.test(value)) {
          return { passwordSpecialCharacter: true }; // Check for at least one special character
        } else if (!/\d/u.test(value)) {
          return { passwordDigit: true }; // Check for at least one number
        } else if (
          this.loginForm.getRawValue().passwordMatchInput &&
          this.loginForm.getRawValue().passwordMatchInput !== value
        ) {
          return { passwordMatch: true }; // check if passwords match
        } else {
          return null; // Password meets all conditions
        }
      } else {
        return null; // no conditions for login page
      }
    };
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const value = control.value as string;
      if (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.loginForm?.getRawValue().passwordInput &&
        this.loginForm.getRawValue().passwordInput !== value &&
        this.title === 'signup'
      ) {
        return { passwordMatch: true }; // check if passwords match
      } else {
        return null; // Password meets all conditions
      }
    };
  }

  emailValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const value = control.value as string;
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/u.test(value)) {
        return { invalidEmail: true }; // check if email is valid
      }
      if (this.users && this.title === 'signup') {
        if (this.users.map((user: UserDTO) => user.email).includes(value)) {
          return { existingEmail: true }; // check if email already exists
        } else {
          return null; // email meets all conditions
        }
      } else {
        return null; // email meets all conditions
      }
    };
  }

  wordCountValidator(minWords: number, maxWords: number): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const value = control.value as string;
      const words = value ? value.trim().split(/\s+/u) : [];
      const wordCount = words.length;
      if (wordCount < minWords) {
        return { tooFewWords: true };
      }
      if (wordCount > maxWords) {
        return { tooManyWords: true };
      }
      return null;
    };
  }

  signupClick(): void {
    const formValue = this.loginForm.getRawValue();
    const newUser: UserDTO = {
      name: formValue.nameInput,
      email: formValue.emailInput,
      nationality: formValue.countryInput,
      userType: this.userType,
      package: 'casual',
      unhashedPassword: formValue.passwordInput,
      profilePicture: null,
      schoolId: 'YouSTUDY', // 0, // placeholder until schools are added // replace with id number
      eltComplete: false,
    };
    this.signup.emit(newUser);
  }
}
