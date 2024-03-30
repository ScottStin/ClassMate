/* eslint-disable @typescript-eslint/no-magic-numbers */
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
import { MatDialog } from '@angular/material/dialog';
import { MatSlider } from '@angular/material/slider';
import { MatStepper } from '@angular/material/stepper';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { combineLatest, Subject, Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { BackgroundImageDTO } from 'src/app/shared/background-images';
import { countryList } from 'src/app/shared/country-list';
import { defaultStyles } from 'src/app/shared/default-styles';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO, UserLoginDTO } from 'src/app/shared/models/user.model';

import { SchoolLoginRedirectorComponent } from '../school-login-redirector/school-login-redirector.component';

@Component({
  selector: 'app-login-card-school',
  templateUrl: './login-card-school.component.html',
  styleUrls: ['./login-card-school.component.css'],
})
export class LoginCardSchoolComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(MatStepper) readonly loginFormSchoolStepper!: MatStepper;
  @ViewChild('gradientColorSlider') gradientColorSlider: MatSlider;

  @Input() title: string;
  @Input() users: UserDTO[] | null;
  @Input() schools: SchoolDTO[] | null;
  @Input() currentSchool: SchoolDTO | null;
  @Input() usersLoading!: boolean;
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
  @Output() signupSchool = new EventEmitter<SchoolDTO>();
  @Output() login = new EventEmitter<UserLoginDTO>();
  @Output() changeBackgroundImage = new EventEmitter<BackgroundImageDTO>();

  // --- formatiting options:
  // backgroundImages = backgroundImages;
  // selectedBackgroundImage: {
  //   name: string;
  //   label: string;
  //   shadow: string;
  // } | null = this.backgroundImages[0];
  // primaryButtonBackgroundColor = '#6200EE';
  // primaryButtonTextColor = '#FFFFFF';

  public backgroundImageType: string;
  stepperDisplay = 'flex';
  private subscription?: Subscription;
  backgroundGradient: string | undefined;
  defaultStyles = defaultStyles;

  // --- image cropping:
  imageChangedEvent: Event | string = '';
  imageCropper: ImageCropperComponent;
  photoLink: string | null | undefined;
  photoName: string;

  // --- form:
  lessonTypes = [
    { name: 'General English', shortName: 'Gen English' },
    { name: 'PTE Exam Prep', shortName: 'PTE' },
    { name: 'IELTS Exam Prep', shortName: 'IELTS' },
    { name: 'Cambridge Exam Prep', shortName: 'Cambridge' },
  ];
  lessonTypeShortName: string;
  lessonTypeLongName: string;
  hidePassword = true;
  countryList = countryList;

  loginFormSchool: FormGroup<{
    detailStep: DetailStep;
    formatStep: FormatStep;
    backgroundStep: BackgroundStep;
    logoStep: LogoStep;
    lessonStep: LessonStep;
  }> | null = null;
  formPopulated = new Subject<boolean>();

  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // this.toggleCardFlip();
    this.users?.map((user: UserDTO) => user.email);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('userType' in changes || 'usersLoading' in changes) {
      if (this.userType && this.userType === 'school') {
        this.populateSignupForm();
      }
    }
    if ('title' in changes) {
      if (this.title !== 'signup') {
        this.stepperDisplay = 'none';
      } else {
        this.stepperDisplay = 'flex';
      }
      this.populateSignupForm();
    }
    if ('currentSchool' in changes) {
      this.populateSignupForm();
    }
    if ('schools' in changes) {
      console.log(this.schools);
    }
  }

  populateSignupForm(): void {
    // details step:
    const detailStepForm: DetailStep = new FormGroup({
      nameInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      emailInput: new FormControl(
        {
          value: this.currentSchool ? this.currentSchool.email : '',
          disabled: this.usersLoading || this.currentSchool !== null,
        },
        {
          validators: [],
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
          validators: [],
          nonNullable: true,
        }
      ),
      passwordInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      passwordMatchInput: new FormControl(
        { value: '', disabled: this.usersLoading },
        {
          validators: [],
          nonNullable: true,
        }
      ),
    });

    // add validators to details step:
    if (this.title === 'signup') {
      detailStepForm.controls.descriptionInput.setValidators([
        Validators.required,
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        this.wordCountValidator(10, 200),
      ]);
      detailStepForm.controls.emailInput.setValidators([
        this.emailValidator(),
        Validators.required,
      ]);
      detailStepForm.controls.countryInput.setValidators(Validators.required);
      detailStepForm.controls.passwordInput.setValidators([
        this.passwordValidator(),
        Validators.required,
      ]);
      detailStepForm.controls.passwordMatchInput.setValidators(
        this.passwordMatchValidator()
      );
      detailStepForm.controls.nameInput.setValidators([
        Validators.required,
        this.nameValidator(),
      ]);
    } else {
      detailStepForm.controls.descriptionInput.clearValidators();
      detailStepForm.controls.emailInput.clearValidators();
      detailStepForm.controls.countryInput.clearValidators();
      detailStepForm.controls.passwordInput.clearValidators();
      detailStepForm.controls.passwordMatchInput.clearValidators();
      detailStepForm.controls.nameInput.clearValidators();

      detailStepForm.controls.emailInput.setValidators(Validators.required);
      detailStepForm.controls.passwordInput.setValidators(Validators.required);
    }

    detailStepForm.controls.descriptionInput.updateValueAndValidity();
    detailStepForm.controls.emailInput.updateValueAndValidity();
    detailStepForm.controls.countryInput.updateValueAndValidity();
    detailStepForm.controls.passwordInput.updateValueAndValidity();
    detailStepForm.controls.passwordMatchInput.updateValueAndValidity();
    detailStepForm.controls.nameInput.updateValueAndValidity();

    // format step:
    const formatStepForm: FormatStep = new FormGroup({
      // backgroundImageInput: new FormControl(
      //   this.selectedBackgroundImage ?? null,
      //   {
      //     validators: [],
      //     nonNullable: false,
      //   }
      // ),
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

    const backgroundStepForm: BackgroundStep = new FormGroup({
      backgroundImageInput: new FormControl(
        this.selectedBackgroundImage ?? null,
        {
          validators: [],
          nonNullable: false,
        }
      ),
      backgroundGradientColor1: new FormControl('', {
        validators: [],
        nonNullable: false,
      }),
      backgroundGradientColor2: new FormControl('', {
        validators: [],
        nonNullable: false,
      }),
      backgroundGradientSlider: new FormControl(NaN, {
        validators: [],
        nonNullable: true,
      }),
      backgroundGradientRotation: new FormControl(NaN, {
        validators: [],
        nonNullable: true,
      }),
      backgroundGradientType: new FormControl('', {
        validators: [],
        nonNullable: false,
      }),
    });

    // logo step:
    const logoStepForm: LogoStep = new FormGroup({
      schoolLogo: new FormControl<{
        url: string;
        filename: string;
      } | null>(null, {
        validators: [],
        nonNullable: false,
      }),
    });

    // lesson type step:
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

    // logn form group:
    this.loginFormSchool = new FormGroup({
      detailStep: detailStepForm,
      formatStep: formatStepForm,
      backgroundStep: backgroundStepForm,
      logoStep: logoStepForm,
      lessonStep: lessonStepForm,
    });

    // Subscribe to the combined changes
    const combinedChanges = combineLatest([
      this.loginFormSchool.controls.backgroundStep.controls.backgroundImageInput
        .valueChanges,
    ]);

    this.subscription = combinedChanges.subscribe(([backgroundImageValue]) => {
      if (backgroundImageValue) {
        this.selectedBackgroundImage = backgroundImageValue;
        this.changeBackgroundImage.emit({
          ...this.selectedBackgroundImage,
          type: this.backgroundImageType,
        });
        this.snackbarService.openPermanent(
          'info',
          "Can't decide on a good background image? Don't worry, you can always change it later!"
        );
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

  changeLessonType(lesson: string, value: string): void {
    if (lesson === 'lessonTypeShortName') {
      this.lessonTypeShortName = value;
    } else {
      this.lessonTypeLongName = value;
    }
  }

  addLessonType(name: string, shortName: string): void {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (this.lessonTypes.length >= 5) {
      this.snackbarService.openPermanent(
        'error',
        'Sorry, you can only have a maximum of 5 class types.',
        'dismiss'
      );
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    } else if (!name || !shortName) {
      this.snackbarService.openPermanent(
        'warn',
        'Please enter a name and abbreviated name for your lesson',
        'dismiss'
      );
    } else if (name.length > 35) {
      this.snackbarService.openPermanent(
        'warn',
        'Your long lesson name cannot be more than 35 characters.',
        'dismiss'
      );
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    } else if (shortName.length > 10) {
      this.snackbarService.openPermanent(
        'warn',
        'Your abbreviated lesson name cannot be more than 10 characters.',
        'dismiss'
      );
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    } else {
      this.lessonTypes.push({ name, shortName });
    }
  }

  removeLessonType(name: string, shortName: string): void {
    this.lessonTypes = this.lessonTypes.filter(
      (item) => !(item.name === name && item.shortName === shortName)
    );
  }

  toggleCardFlip(removeCurrentSchool: boolean | undefined): void {
    this.existingEmailFormatChange('');
    this.isFlipped = !this.isFlipped;
    this.cardFlipped.emit({ isFlipped: this.isFlipped, removeCurrentSchool });
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
          this.loginFormSchool?.controls.detailStep.getRawValue()
            .passwordInput !== value
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
        this.loginFormSchool?.controls.detailStep.getRawValue()
          .passwordInput !== value &&
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
      if (this.schools && this.title === 'signup') {
        if (
          this.schools
            .map((school: SchoolDTO) => school.email.toLowerCase())
            .includes(value.toLowerCase())
        ) {
          return { existingEmailLogin: true }; // check if email already exists
        } else {
          return null; // email meets all conditions
        }
      } else {
        return null; // email meets all conditions
      }
    };
  }

  nameValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const value = control.value as string;
      if (this.schools && this.title === 'signup') {
        if (
          this.schools
            .map((school: SchoolDTO) =>
              school.name.replace(/ /gu, '-').toLowerCase()
            )
            .includes(value.toLowerCase())
        ) {
          return { existingNamelLogin: true }; // check if name already exists
        } else {
          return null; // name meets all conditions
        }
      } else {
        return null; // name meets all conditions
      }
    };
  }

  existingEmailFormatChange(email: string): void {
    if (email !== '') {
      const foundSchool = this.schools?.find(
        (obj) => obj.email.toLocaleLowerCase() === email.toLocaleLowerCase()
      );
      if (foundSchool) {
        this.selectedBackgroundImage = foundSchool.backgroundImage;
        this.primaryButtonBackgroundColor =
          foundSchool.primaryButtonBackgroundColor;
        this.primaryButtonTextColor = foundSchool.primaryButtonTextColor;
        this.photoSrc = foundSchool.logo?.url ?? '../../../assets/School.png';
        this.changeBackgroundImage.emit(this.selectedBackgroundImage);
      } else {
        this.selectedBackgroundImage =
          this.defaultStyles.selectedBackgroundImage; // this.backgroundImages[0];
        this.primaryButtonBackgroundColor =
          this.defaultStyles.primaryButtonBackgroundColor;
        this.primaryButtonTextColor = this.defaultStyles.primaryButtonTextColor;
        this.photoSrc = '../../../assets/School.png';
        this.changeBackgroundImage.emit(
          this.defaultStyles.selectedBackgroundImage
        );
      }
    } // else if (this.currentSchool) {}
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
    const formValue = this.loginFormSchool?.controls.detailStep.getRawValue();
    if (formValue) {
      const newSchool: SchoolDTO = {
        name: formValue.nameInput,
        email: formValue.emailInput,
        nationality: formValue.countryInput,
        description: formValue.descriptionInput,
        unhashedPassword: formValue.passwordInput,
        backgroundImage: this.selectedBackgroundImage!,
        primaryButtonBackgroundColor: this.primaryButtonBackgroundColor,
        primaryButtonTextColor: this.primaryButtonTextColor,
        lessonTypes: this.lessonTypes,
        logo: this.loginFormSchool?.controls.logoStep.controls.schoolLogo.value,
      };
      this.signupSchool.emit(newSchool);
    }
  }

  loginClick(): void {
    const formValue = this.loginFormSchool?.controls.detailStep.getRawValue();
    if (formValue) {
      this.login.emit({
        email: formValue.emailInput,
        unhashedPassword: formValue.passwordInput,
      });
    }
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
    this.photoLink = event.base64;
    this.loginFormSchool?.controls.logoStep.controls.schoolLogo.setValue({
      url: this.photoLink!,
      filename: this.photoName,
    });
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

  onFormTypeChange(val: string): void {
    this.backgroundImageType = val;
  }

  formatColorSliderLabel(value: number): number | string {
    if (value >= 1000) {
      return `${Math.round(value / 1000)}k`;
    }
    return value;
  }

  createBackgroundGradient(): void {
    if (this.loginFormSchool) {
      const gradientColor1: string | null =
        this.loginFormSchool.controls.backgroundStep.controls
          .backgroundGradientColor1.value;

      const gradientColor2 =
        this.loginFormSchool.controls.backgroundStep.controls
          .backgroundGradientColor2.value;

      const backgroundGradientRotation =
        this.loginFormSchool.controls.backgroundStep.controls
          .backgroundGradientRotation.value;

      const backgroundGradientType: string | null =
        this.loginFormSchool.controls.backgroundStep.controls
          .backgroundGradientType.value;

      const gradientSlider = this.gradientColorSlider.value;

      if (gradientColor1 !== null && gradientColor1 !== '') {
        if (backgroundGradientType !== 'radial') {
          this.backgroundGradient = `linear-gradient(${
            backgroundGradientRotation ? backgroundGradientRotation : 90
          }deg, ${gradientColor1} ${gradientSlider ? gradientSlider : 0}%, ${
            gradientColor2 !== null && gradientColor2 !== ''
              ? gradientColor2
              : '#000000'
          } 100%)`;
        } else {
          this.backgroundGradient = `radial-gradient(circle at 50% 50%, ${gradientColor1} ${
            gradientSlider ? gradientSlider / 2 : 10
          }%, ${
            gradientColor2 !== null && gradientColor2 !== ''
              ? gradientColor2
              : '#000000'
          } ${gradientSlider ? gradientSlider : 20}%)`;
        }

        this.changeBackgroundImage.emit({
          name: this.backgroundGradient,
          type: this.backgroundImageType,
          label: '',
          shadow: '',
        });
      }
      // else {
      // }
    }
  }

  createBackgroundColor(): void {
    if (
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      this.loginFormSchool?.controls.backgroundStep.controls
        .backgroundGradientColor1.value
    ) {
      const backgroundColor: string =
        this.loginFormSchool.controls.backgroundStep.controls
          .backgroundGradientColor1.value;

      this.changeBackgroundImage.emit({
        name: backgroundColor,
        type: this.backgroundImageType,
        label: '',
        shadow: '',
      });
    }
  }

  openSchoolLoginRedirector(): void {
    this.dialog.open(SchoolLoginRedirectorComponent, {
      data: {
        schools: this.schools,
        email:
          this.loginFormSchool?.controls.detailStep.controls.emailInput.value,
      },
    });
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
  // backgroundImageInput: FormControl<{
  //   name: string;
  //   label: string;
  //   shadow: string;
  // } | null>;
  primaryButtonBackgroundColor: FormControl<string>;
  primaryButtonTextColor: FormControl<string>;
}>;

export type BackgroundStep = FormGroup<{
  backgroundImageInput: FormControl<{
    name: string;
    label: string;
    shadow: string;
  } | null>;
  backgroundGradientColor1: FormControl<string | null>;
  backgroundGradientColor2: FormControl<string | null>;
  backgroundGradientSlider: FormControl<number>;
  backgroundGradientRotation: FormControl<number>;
  backgroundGradientType: FormControl<string | null>;
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
