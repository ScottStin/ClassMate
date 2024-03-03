import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
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
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { combineLatest, Subject, Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { backgroundImages } from 'src/app/shared/background-images';
import { countryList } from 'src/app/shared/country-list';
import { UserDTO, UserLoginDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.css'],
})
export class LoginCardComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(MatStepper) readonly loginFormSchoolStepper!: MatStepper;
  @Input() title!: string;
  @Input() users!: UserDTO[] | null;
  @Input() usersLoading!: boolean;
  @Input() userType: string;
  @Input() isFlipped!: boolean;
  @Input() photoSrc!: string;
  @Output() cardFlipped = new EventEmitter<boolean>();
  @Output() signup = new EventEmitter<UserDTO>();
  @Output() login = new EventEmitter<UserLoginDTO>();
  @Output() changeBackgroundImage = new EventEmitter<{
    name: string;
    label: string;
    shadow: string;
  }>();
  countryList = countryList;
  backgroundImages = backgroundImages;
  hidePassword = true;
  selectedBackgroundImage: {
    name: string;
    label: string;
    shadow: string;
  } | null = this.backgroundImages[0];
  primaryButtonBackgroundColor = '#6200EE';
  primaryButtonTextColor = '#FFFFFF';
  private subscription?: Subscription;

  imageChangedEvent: Event | string = '';
  imageCropper: ImageCropperComponent;
  photoLink: string | null | undefined;
  photoName: string;

  loginForm!: FormGroup<{
    nameInput: FormControl<string>;
    emailInput: FormControl<string>;
    countryInput: FormControl<string>;
    personalStatement: FormControl<string>;
    passwordInput: FormControl<string>;
    passwordMatchInput: FormControl<string>;
  }>;

  loginFormSchool: FormGroup<{
    detailStep: DetailStep;
    formatStep: FormatStep;
    logoStep: LogoStep;
    lessonStep: LessonStep;
  }> | null = null;

  formPopulated = new Subject<boolean>();

  constructor(private readonly snackbarService: SnackbarService) {}

  ngOnInit(): void {
    this.users?.map((user: UserDTO) => user.email);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('userType' in changes || 'usersLoading' in changes) {
      if (this.userType && this.userType === 'school') {
        this.populateSignupForm();
      }
      if (this.userType && this.userType !== 'school') {
        this.populateForm();
      }
    }
  }

  populateForm(): void {
    this.loginForm = new FormGroup({
      nameInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [Validators.required],
          nonNullable: true,
        }
      ),
      emailInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [Validators.required, this.emailValidator()],
          nonNullable: true,
        }
      ),
      countryInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      personalStatement: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          validators: [this.wordCountValidator(10, 200)],
          nonNullable: true,
        }
      ),
      passwordInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [Validators.required, this.passwordValidator()],
          nonNullable: true,
        }
      ),
      passwordMatchInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [this.passwordMatchValidator()],
          nonNullable: true,
        }
      ),
    });
    this.formPopulated.next(true);
  }

  populateSignupForm(): void {
    const detailStepForm: DetailStep = new FormGroup({
      nameInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [Validators.required],
          nonNullable: true,
        }
      ),
      emailInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [Validators.required, this.emailValidator()],
          nonNullable: true,
        }
      ),
      countryInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [Validators.required],
          nonNullable: true,
        }
      ),
      phoneNumberInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      addressInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      descriptionInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          validators: [this.wordCountValidator(10, 200)],
          nonNullable: true,
        }
      ),
      passwordInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [Validators.required, this.passwordValidator()],
          nonNullable: true,
        }
      ),
      passwordMatchInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [this.passwordMatchValidator()],
          nonNullable: true,
        }
      ),
    });

    const formatStepForm: FormatStep = new FormGroup({
      backgroundImageInput: new FormControl(
        this.selectedBackgroundImage ?? null,
        {
          validators: [],
          nonNullable: false,
        }
      ),
      primaryButtonBackgroundColor: new FormControl(
        { value: '#6200EE', disabled: this.usersLoading },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      primaryButtonTextColor: new FormControl(
        { value: '#FFFFFF', disabled: this.usersLoading },
        {
          validators: [],
          nonNullable: true,
        }
      ),
    });

    const logoStepForm: LogoStep = new FormGroup({
      schoolLogo: new FormControl<{
        url: string;
        filename: string;
      } | null>(null, {
        validators: [],
        nonNullable: false,
      }),
    });

    const lessonStepForm: LessonStep = new FormGroup({
      lessonType: new FormControl<
        | {
            name: string;
            shortName: string;
          }[]
        | null
      >(null, {
        validators: [],
        nonNullable: false,
      }),
    });

    this.loginFormSchool = new FormGroup({
      detailStep: detailStepForm,
      formatStep: formatStepForm,
      logoStep: logoStepForm,
      lessonStep: lessonStepForm,
    });

    // Subscribe to the combined changes

    const combinedChanges = combineLatest([
      this.loginFormSchool.controls.formatStep.controls.backgroundImageInput
        .valueChanges,
    ]);

    this.subscription = combinedChanges.subscribe(([backgroundImageValue]) => {
      if (backgroundImageValue) {
        this.selectedBackgroundImage = backgroundImageValue;
        this.changeBackgroundImage.emit(this.selectedBackgroundImage);
      }
    });
  }

  changePrimaryButtonBackgroundColor(color: string): void {
    this.primaryButtonBackgroundColor = color;
    this.snackbarService.openPermanent(
      'info',
      'Hint: try to avoid using oranges and reds for your main button background color, as these are used for alert and warning buttons',
      'dismiss'
    );
  }

  changePrimaryButtonTextColor(color: string): void {
    this.primaryButtonTextColor = color;
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

  loginClick(): void {
    const formValue = this.loginForm.getRawValue();
    this.login.emit({
      email: formValue.emailInput,
      unhashedPassword: formValue.passwordInput,
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Photo Cropping and Upload
   */

  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
    const input = event.target as HTMLInputElement;
    if (input.files) {
      if (this.validateImage(input.files[0])) {
        this.photoName = input.files[0].name;
      }
    }
  }

  imageCropped(event: ImageCroppedEvent): void {
    // this.photoLink = event.base64;
    // this.loginForm.controls.schoolLogo.setValue({
    //   url: this.photoLink!,
    //   filename: this.photoName,
    // });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  imageLoaded(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  cropperReady(): void {}

  loadImageFailed(): void {
    this.snackbarService.openPermanent(
      'error',
      'image failed to load',
      'dismiss'
    );
  }

  validateImage(image: File): boolean {
    const types = ['image/png', 'image/gif', 'image/tiff', 'image/jpeg'];
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const maxSize = 1000 * 1024; // 1000 KB
    if (!types.includes(image.type)) {
      this.snackbarService.openPermanent(
        'error',
        'Picture must be .png/.gif/.tif/.jpg type',
        'dismiss'
      );
      return false;
    }
    if (image.size > maxSize) {
      this.snackbarService.openPermanent(
        'error',
        'File must be 1-1000 kb in size',
        'dismiss'
      );
      return false;
    }

    return true;
  }
}

export type DetailStep = FormGroup<{
  nameInput: FormControl<string>;
  emailInput: FormControl<string>;
  countryInput: FormControl<string>;
  phoneNumberInput: FormControl<string>;
  addressInput: FormControl<string>;
  descriptionInput: FormControl<string>;
  passwordInput: FormControl<string>;
  passwordMatchInput: FormControl<string>;
}>;

export type FormatStep = FormGroup<{
  backgroundImageInput: FormControl<{
    name: string;
    label: string;
    shadow: string;
  } | null>;
  primaryButtonBackgroundColor: FormControl<string>;
  primaryButtonTextColor: FormControl<string>;
}>;

export type LogoStep = FormGroup<{
  schoolLogo: FormControl<{
    url: string;
    filename: string;
  } | null>;
}>;

export type LessonStep = FormGroup<{
  lessonType: FormControl<{ name: string; shortName: string }[] | null>;
}>;
