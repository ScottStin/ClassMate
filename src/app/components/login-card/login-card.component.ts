import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { countryList } from 'src/app/shared/country-list';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.css'],
})
export class LoginCardComponent implements OnInit {
  @Input() title!: string;
  @Output() cardFlipped = new EventEmitter<boolean>();
  @Output() signup = new EventEmitter<UserDTO>();
  countryList = countryList;
  hidePassword = true;

  loginForm!: FormGroup<{
    nameInput: FormControl<string>;
    emailInput: FormControl<string>;
    countryInput: FormControl<string>;
    passwordInput: FormControl<string>;
    passwordMatchInput: FormControl<string>;
  }>;

  isFlipped = false;
  backgroundPhoto = '../../../assets/BackgroundHorizontal-1.png';
  studentPhotoSrc = '../../../assets/Student.png';
  formPopulated = new Subject<boolean>();
  userType: 'student' | 'teacher' | '' = '';

  constructor(private readonly router: Router) {
    this.router.events.subscribe(() => {
      setTimeout(() => {
        const urlAddress: string[] = this.router.url.split('/');
        if (urlAddress.includes('student')) {
          this.userType = 'student';
        }
        if (urlAddress.includes('teacher')) {
          this.userType = 'student';
        }
        if (urlAddress.includes('signup')) {
          this.title = 'signup';
          this.isFlipped = false;
        }
        if (urlAddress.includes('login')) {
          this.title = 'login';
          this.isFlipped = true;
        }
      }, 0);
    });
  }

  ngOnInit(): void {
    this.populateForm();
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
      } else {
        return null; // email meets all conditions
      }
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
      schoolId: 0, // placeholder until schools are added
      eltComplete: false,
    };
    this.signup.emit(newUser);
  }
}
