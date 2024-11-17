import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { BackgroundImageDTO } from 'src/app/shared/background-images';
import { countryList } from 'src/app/shared/country-list';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import {
  CreateUserDTO,
  UserDTO,
  UserLoginDTO,
} from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.css'],
})
export class LoginCardComponent implements OnInit, OnChanges {
  @ViewChild(MatStepper) readonly loginFormSchoolStepper!: MatStepper;
  @Input() title: string;
  @Input() users: UserDTO[] | null;
  @Input() pageLoading: boolean;
  @Input() currentSchool: SchoolDTO | null;
  @Input() userType: string;
  @Input() isFlipped!: boolean;
  @Input() photoSrc!: string;
  @Input() backgroundImages: BackgroundImageDTO[];
  @Input() selectedBackgroundImage: BackgroundImageDTO | null;
  @Input() primaryButtonBackgroundColor: string;
  @Input() primaryButtonTextColor: string;
  @Output() cardFlipped = new EventEmitter<{
    isFlipped: boolean;
    removeCurrentSchool: boolean | undefined;
  }>();
  @Output() signup = new EventEmitter<CreateUserDTO>();
  @Output() login = new EventEmitter<UserLoginDTO>();
  @Output() changeBackgroundImage = new EventEmitter<{
    name: string;
    label: string;
    shadow: string;
  }>();
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

  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.users?.map((user: UserDTO) => user.email);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('userType' in changes || 'pageLoading' in changes) {
      if (this.userType && this.userType !== 'school') {
        this.populateForm();
      }
    }
  }

  populateForm(): void {
    this.loginForm = new FormGroup({
      nameInput: new FormControl(
        { value: '', disabled: this.pageLoading },
        {
          validators: [Validators.required],
          nonNullable: true,
        }
      ),
      emailInput: new FormControl(
        { value: '', disabled: this.pageLoading },
        {
          validators: [Validators.required, this.emailValidator()],
          nonNullable: true,
        }
      ),
      countryInput: new FormControl(
        { value: '', disabled: this.pageLoading },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      personalStatement: new FormControl(
        { value: '', disabled: this.pageLoading },
        {
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          validators: [this.wordCountValidator(10, 200)],
          nonNullable: true,
        }
      ),
      passwordInput: new FormControl(
        { value: '', disabled: this.pageLoading },
        {
          validators: [Validators.required, this.passwordValidator()],
          nonNullable: true,
        }
      ),
      passwordMatchInput: new FormControl(
        { value: '', disabled: this.pageLoading },
        {
          validators: [this.passwordMatchValidator()],
          nonNullable: true,
        }
      ),
    });
    this.formPopulated.next(true);
  }

  toggleCardFlip(): void {
    this.isFlipped = !this.isFlipped;
    this.cardFlipped.emit({
      isFlipped: this.isFlipped,
      removeCurrentSchool: undefined,
    });
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
          return { existingEmailLogin: true }; // check if email already exists
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
      if (this.title === 'signup' && this.userType === 'teacher') {
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
      } else {
        return null;
      }
    };
  }

  signupClick(): void {
    const formValue = this.loginForm.getRawValue();
    const newUser: CreateUserDTO = {
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

  loginClick(): void {
    const formValue = this.loginForm.getRawValue();
    this.login.emit({
      email: formValue.emailInput,
      unhashedPassword: formValue.passwordInput,
    });
  }

  async returnWelcomePage(): Promise<void> {
    if (this.currentSchool) {
      await this.router.navigate([
        `${this.currentSchool.name.replace(/ /gu, '-').toLowerCase()}/welcome`,
      ]);
    }
  }
}
