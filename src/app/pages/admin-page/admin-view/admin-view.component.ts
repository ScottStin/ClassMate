import {
  Component,
  EventEmitter,
  Input,
  NgIterable,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSlider } from '@angular/material/slider';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { Subject } from 'rxjs';
import {
  BackgroundStep,
  DetailStep,
  FormatStep,
  LessonStep,
  LogoStep,
} from 'src/app/pages/login-page/login-card-school/login-card-school.component';
import {
  ImageCroppingType,
  ImageService,
  ImageType,
} from 'src/app/services/image-service/image.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { TempStylesDTO } from 'src/app/services/temp-styles-service/temp-styles-service.service';
import { BackgroundImageDTO } from 'src/app/shared/background-images';
import { countryList } from 'src/app/shared/country-list';
import { defaultStyles } from 'src/app/shared/default-styles';
import { LessonDTO, LessonTypeDTO } from 'src/app/shared/models/lesson.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css'],
})
export class AdminViewComponent implements OnInit, OnChanges {
  @ViewChild('backgroundGradientSlider') backgroundGradientSlider: MatSlider;
  @Input() primaryButtonBackgroundColor: string;
  @Input() primaryButtonTextColor: string;
  @Input() errorColor: string;
  @Input() warnColor: string;
  @Input() selectedBackgroundImage: BackgroundImageDTO | undefined;
  @Input() adminPageLoading: boolean;
  @Input() currentSchool: SchoolDTO | null;
  @Input() backgroundImages: BackgroundImageDTO[];
  @Input() lessons: LessonDTO[] | null;
  @Output() saveSchoolDetails = new EventEmitter<{
    key: string;
    value: string | LessonTypeDTO[];
  }>();
  @Output() updateTempStyles = new EventEmitter<TempStylesDTO | null>();
  @Output() updateLessons = new EventEmitter<LessonTypeDTO[]>();

  lessonTypesModified: LessonTypeDTO[] = [];
  editLessonTypes = false;

  countryList = countryList;
  defaultStyles = defaultStyles;
  edit:
    | AdminSettingRow
    | AdminStylesRow
    | AdminBackgroundRow
    | LogoRow
    | LessonsRow
    | null = null;
  editGradient = false;
  public backgroundImageType = '';
  backgroundGradient = '';

  // --- image cropping:
  primaryPhoto: ImageCroppingType = {
    imageChangedEvent: '',
    imageCropper: {} as ImageCropperComponent,
    photoName: '',
  };
  secondaryPhoto: ImageCroppingType = {
    imageChangedEvent: '',
    imageCropper: {} as ImageCropperComponent,
    photoName: '',
  };
  photoLink: string | null | undefined;

  tabs: {
    title: string;
    form:
      | 'detailStep'
      | 'formatStep'
      | 'backgroundStep'
      | 'logoStep'
      | 'lessonStep';
    // | 'paymentStep'
    // | 'infoStep';
    formValues:
      | NgIterable<
          | AdminSettingRow
          | AdminStylesRow
          | AdminBackgroundRow
          | LogoRow
          | LessonsRow
        >
      | null
      | undefined;
  }[] = [
    {
      title: 'details',
      form: 'detailStep',
      formValues: undefined,
    },
    {
      title: 'styles',
      form: 'formatStep',
      formValues: undefined,
    },
    {
      title: 'background',
      form: 'backgroundStep',
      formValues: undefined,
    },
    {
      title: 'logo',
      form: 'logoStep',
      formValues: undefined,
    },
    {
      title: 'lessons',
      form: 'lessonStep',
      formValues: undefined,
    },
  ];

  // --- forms:
  adminForm: FormGroup<{
    detailStep: DetailStep;
    formatStep: FormatStep;
    backgroundStep: BackgroundStep;
    logoStep: LogoStep;
    lessonStep: LessonStep;
  }> | null = null;
  formPopulated = new Subject<boolean>();

  constructor(
    private readonly snackbarService: SnackbarService,
    readonly imageService: ImageService
  ) {}

  ngOnInit(): void {
    if (this.selectedBackgroundImage) {
      this.backgroundGradient = this.selectedBackgroundImage.name;
    }
    this.populateForm();
    this.populateTabs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('selectedBackgroundImage' in changes && this.selectedBackgroundImage) {
      this.backgroundGradient = this.selectedBackgroundImage.name;
    }
    if ('currentSchool' in changes && this.currentSchool) {
      this.lessonTypesModified = [...this.currentSchool.lessonTypes];
    }
  }

  getFormControl(formGroup: FormGroup, dataRef: string): FormControl | null {
    const control = formGroup.controls[dataRef] as FormControl;
    return control;
  }

  populateTabs(): void {
    this.tabs[0].formValues = [
      {
        dataRef: 'nameInput',
        tooltip: `The name of your school.`,
        title: `Name`,
        key: 'name',
      },
      {
        dataRef: 'emailInput',
        tooltip: `The admin email of your school. This will be used to log in and out and for students to contact you.`,
        title: `Email`,
        key: 'email',
      },
      {
        dataRef: 'countryInput',
        tooltip: `In what country is your school based?`,
        title: `Country`,
        key: 'nationality',
        formType: 'select',
      },
      {
        dataRef: 'phoneNumberInput',
        tooltip: `How can students contact you?`,
        title: `Phone`,
        key: 'phone',
      },
      {
        dataRef: 'addressInput',
        tooltip: `Where is your school located?`,
        title: `Address`,
        key: 'address',
      },
      {
        dataRef: 'descriptionInput',
        tooltip: `Tell your students a little but about your school...`,
        title: `Description`,
        key: 'description',
        formType: 'text-area',
      },
      {
        dataRef: 'passwordInput',
        tooltip: `Must have between 6-16 characters, at least one uppercase letter, at least one lowercase letter, one number and one special character.`,
        title: `Password`,
        key: 'password',
      },
    ] as AdminSettingRow[];

    this.tabs[1].formValues = [
      {
        dataRef: 'primaryButtonBackgroundColor',
        tooltip: `This is the color of your main buttons and text. You should choose a dark color that can be seen against a white background.`,
        title: `Primary Color`,
        key: 'primaryButtonBackgroundColor',
        formType: 'color-picker',
      },
      {
        dataRef: 'primaryButtonTextColor',
        tooltip: `This is the color of your secondary text. You should choose a light color that can be seen against a dark background.`,
        title: `Secondary Color`,
        key: 'primaryButtonTextColor',
        formType: 'color-picker',
      },
      {
        dataRef: 'warnColor',
        tooltip: `This is the color used to give the user warnings and alerts. It should be a strong color that stands out against a light background (e.g. an orange or dark yellow). It should be different from your Primary Color.`,
        title: `Warn Color`,
        key: 'warnColor',
        formType: 'color-picker',
      },
      {
        dataRef: 'errorColor',
        tooltip: `This is the color used to display errors and fail messages. It should be a strong color that stands out against a light background (e.g. a red). It should be different from your Primary Color and stronger than your warn color.`,
        title: `Error Color`,
        key: 'errorColor',
        formType: 'color-picker',
      },
    ] as AdminStylesRow[];

    this.tabs[2].formValues = [
      {
        dataRef: 'backgroundImageInput',
        tooltip: `Select one of our cool, stylish pattern to use as your background image`,
        title: `Background Image`,
        key: 'backgroundImageInput',
        formType: 'select',
        hide: this.backgroundImageType !== 'pattern',
      },
      {
        dataRef: 'backgroundGradientColor1',
        tooltip: `Your primary background color.`,
        title: `Background Color`,
        key: 'backgroundGradientColor1',
        formType: 'color-picker',
        hide: !['gradient', 'color'].includes(this.backgroundImageType),
      },
      {
        dataRef: 'backgroundGradientColor2',
        tooltip: `Your second gradient color.`,
        title: `Second Background Color`,
        key: 'backgroundGradientColor2',
        formType: 'color-picker',
        hide: this.backgroundImageType !== 'gradient',
      },
      {
        dataRef: 'backgroundGradientSlider',
        tooltip: `Where your gradient will transition from the main color to the second color.`,
        title: `Gradient Position`,
        key: 'backgroundGradientSlider',
        formType: 'slider',
        hide: this.backgroundImageType !== 'gradient',
      },
      {
        dataRef: 'backgroundGradientType',
        tooltip: `Choose between a linear gradient and a radial gradient.`,
        title: `Gradient Type`,
        key: 'backgroundGradientType',
        formType: 'select',
        hide: this.backgroundImageType !== 'gradient',
      },
      {
        dataRef: 'backgroundGradientRotation',
        tooltip: `The angle of your gradient.`,
        title: `Gradient Rotation`,
        key: 'backgroundGradientRotation',
        formType: 'select',
        hide: this.backgroundImageType !== 'gradient',
      },
    ] as AdminBackgroundRow[];

    this.tabs[3].formValues = [
      {
        dataRef: 'schoolLogoPrimary',
        tooltip: `Upload your school's primary logo. This is a 4x3 size logo that students and teachers will see when logging in.`,
        title: `School Logo (Primary)`,
        key: 'logoPrimary',
        formType: 'image',
      },
      {
        dataRef: 'schoolLogoSecondary',
        tooltip: `Upload your school's secondary logo. This is a longer, 6x2 size logo that students and teachers will see in the top left corner of the page.`,
        title: `School Logo (Secondary)`,
        key: 'logoSecondary',
        formType: 'image',
      },
    ] as LogoRow[];

    this.tabs[4].formValues = [
      {
        dataRef: 'lessons',
        formType: 'other',
        hide: true,
      },
    ] as LessonsRow[];
  }

  populateForm(): void {
    // details step:
    const detailStepForm: DetailStep = new FormGroup({
      nameInput: new FormControl(
        {
          value: this.currentSchool?.name ?? '',
          disabled: this.adminPageLoading,
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      emailInput: new FormControl(
        {
          value: this.currentSchool?.email ?? '',
          disabled: this.adminPageLoading,
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      countryInput: new FormControl(
        {
          value: this.currentSchool?.nationality ?? '',
          disabled: this.adminPageLoading,
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      phoneNumberInput: new FormControl(
        {
          value: this.currentSchool?.phone ?? '',
          disabled: this.adminPageLoading,
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      addressInput: new FormControl(
        {
          value: this.currentSchool?.address ?? '',
          disabled: this.adminPageLoading,
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      descriptionInput: new FormControl(
        {
          value: this.currentSchool?.description ?? '',
          disabled: this.adminPageLoading,
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      passwordInput: new FormControl(
        {
          value: '******',
          disabled: this.adminPageLoading,
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      passwordMatchInput: new FormControl(
        {
          value: '******',
          disabled: this.adminPageLoading,
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
    });

    const formatStepForm: FormatStep = new FormGroup({
      primaryButtonBackgroundColor: new FormControl(
        {
          value:
            this.currentSchool?.primaryButtonBackgroundColor ??
            this.defaultStyles.primaryButtonBackgroundColor,
          disabled: this.adminPageLoading,
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      primaryButtonTextColor: new FormControl(
        {
          value:
            this.currentSchool?.primaryButtonTextColor ??
            this.defaultStyles.primaryButtonTextColor,
          disabled: this.adminPageLoading,
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      warnColor: new FormControl(
        {
          value: this.currentSchool?.warnColor ?? this.defaultStyles.warnColor,
          disabled: this.adminPageLoading,
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      errorColor: new FormControl(
        {
          value:
            this.currentSchool?.errorColor ?? this.defaultStyles.errorColor,
          disabled: this.adminPageLoading,
        },
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
      backgroundGradientColor1: new FormControl(
        {
          value: '',
          disabled:
            !this.editGradient &&
            this.backgroundImageType.toLowerCase() === 'gradient',
        },
        {
          validators: [],
          nonNullable: false,
        }
      ),
      backgroundGradientColor2: new FormControl(
        {
          value: '',
          disabled:
            !this.editGradient &&
            this.backgroundImageType.toLowerCase() === 'gradient',
        },
        {
          validators: [],
          nonNullable: false,
        }
      ),
      backgroundGradientSlider: new FormControl(
        {
          value: NaN,
          disabled:
            !this.editGradient &&
            this.backgroundImageType.toLowerCase() === 'gradient',
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      backgroundGradientType: new FormControl(
        {
          value: '',
          disabled:
            !this.editGradient &&
            this.backgroundImageType.toLowerCase() === 'gradient',
        },
        {
          validators: [],
          nonNullable: false,
        }
      ),
      backgroundGradientRotation: new FormControl(
        {
          value: NaN,
          disabled:
            !this.editGradient &&
            this.backgroundImageType.toLowerCase() === 'gradient',
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
    });

    // logo step:
    const logoStepForm: LogoStep = new FormGroup({
      schoolLogoPrimary: new FormControl<ImageType | undefined>(undefined, {
        validators: [],
        nonNullable: true,
      }),
      schoolLogoSecondary: new FormControl<ImageType | undefined>(undefined, {
        validators: [],
        nonNullable: true,
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

    // admin form group:
    this.adminForm = new FormGroup({
      detailStep: detailStepForm,
      formatStep: formatStepForm,
      backgroundStep: backgroundStepForm,
      logoStep: logoStepForm,
      lessonStep: lessonStepForm,
    });
  }

  openEdit(
    row:
      | AdminSettingRow
      | AdminStylesRow
      | AdminBackgroundRow
      | LogoRow
      | LessonsRow
  ): void {
    this.edit = row;
  }

  closeEdit(): void {
    this.edit = null;
    this.updateTempStyles.emit(null);
    this.populateForm();

    this.editLessonTypes = false;
    if (this.currentSchool) {
      this.lessonTypesModified = [...this.currentSchool.lessonTypes];
    }
  }

  onSaveClick(
    row:
      | AdminSettingRow
      | AdminStylesRow
      | AdminBackgroundRow
      | LogoRow
      | LessonsRow
      | { key: string },
    value: string
  ): void {
    this.saveSchoolDetails.emit({ key: row.key, value });
  }

  changeTempStyles(
    feature: string,
    style: string | number | BackgroundImageDTO
  ): void {
    const tempStyles: TempStylesDTO = {};

    if (feature.toLocaleLowerCase() === 'secondary color') {
      tempStyles.primaryButtonTextColor = style as string;
    }

    if (feature.toLocaleLowerCase() === 'primary color') {
      tempStyles.primaryButtonBackgroundColor = style as string;
    }

    if (feature.toLocaleLowerCase() === 'warn color') {
      tempStyles.warnColor = style as string;
    }

    if (feature.toLocaleLowerCase() === 'error color') {
      tempStyles.errorColor = style as string;
    }

    if (feature.toLocaleLowerCase() === 'background image') {
      tempStyles.backgroundColor = {
        ...(style as BackgroundImageDTO),
        type: this.backgroundImageType,
      } as BackgroundImageDTO;
    }

    if (
      feature.toLocaleLowerCase() === 'background color' &&
      this.backgroundImageType.toLocaleLowerCase() === 'color'
    ) {
      tempStyles.backgroundColor = {
        name: style as string,
        type: this.backgroundImageType,
        label: '',
        shadow: '',
      };
    }

    if (
      [
        'second background color',
        'background color',
        'gradient rotation',
        'gradient type',
        'gradient position',
      ].includes(feature.toLocaleLowerCase()) &&
      this.backgroundImageType.toLocaleLowerCase() === 'gradient'
    ) {
      const gradient = this.createBackgroundGradient(
        this.adminForm?.controls.backgroundStep.controls
          .backgroundGradientColor1.value,
        this.adminForm?.controls.backgroundStep.controls
          .backgroundGradientColor2.value,
        this.adminForm?.controls.backgroundStep.controls
          .backgroundGradientRotation.value,
        this.adminForm?.controls.backgroundStep.controls.backgroundGradientType
          .value,
        this.backgroundGradientSlider.value
      );
      tempStyles.backgroundColor = {
        name: gradient,
        type: this.backgroundImageType,
        label: '',
        shadow: '',
      };
    }
    this.updateTempStyles.emit(tempStyles);
  }

  onFormTypeChange(val: string): void {
    this.backgroundImageType = val;
    this.populateTabs();
    this.populateForm();
  }

  createBackgroundGradient(
    gradientColor1?: string | null,
    gradientColor2?: string | null,
    backgroundGradientRotation?: number | null,
    backgroundGradientType?: string | null,
    gradientSlider?: number | null
  ): string {
    // todo - move to service or directive

    let backgroundGradient = '';
    if (gradientColor1 !== null && gradientColor1 !== '') {
      if (backgroundGradientType !== 'radial') {
        backgroundGradient = `linear-gradient(${
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          !Number.isNaN(backgroundGradientRotation)
            ? backgroundGradientRotation
            : 90
        }deg, ${gradientColor1 ?? '#000000'} ${gradientSlider ?? 0}%, ${
          gradientColor2 !== null &&
          gradientColor2 !== undefined &&
          gradientColor2 !== ''
            ? gradientColor2
            : '#000000'
        } 100%)`;
      } else {
        backgroundGradient = `radial-gradient(circle at 50% 50%, ${
          gradientColor1 ?? '#000000'
        } ${
          gradientSlider !== null && gradientSlider !== undefined
            ? gradientSlider / 2
            : 10
        }%, ${
          gradientColor2 !== null &&
          gradientColor2 !== undefined &&
          gradientColor2 !== ''
            ? gradientColor2
            : '#000000'
        } ${gradientSlider ?? 20}%)`;
      }
    }
    return backgroundGradient;
  }

  formatColorSliderLabel(value: number): number | string {
    if (value >= 1000) {
      return `${Math.round(value / 1000)}k`;
    }
    return value;
  }

  /**
   * Photo Cropping and Upload
   */

  fileChangeEvent(event: Event, imageType: 'primary' | 'secondary'): void {
    const input = event.target as HTMLInputElement;
    if (
      !input.files ||
      !this.imageService.validateFile(input.files[0], 'image', 1000 * 1024)
    ) {
      return;
    }

    if (imageType === 'primary') {
      this.primaryPhoto.imageChangedEvent = event;
      this.primaryPhoto.photoName = input.files[0].name;
    }

    if (imageType === 'secondary') {
      this.secondaryPhoto.imageChangedEvent = event;
      this.secondaryPhoto.photoName = input.files[0].name;
    }
  }

  imageCropped(
    event: ImageCroppedEvent,
    imageType: 'primary' | 'secondary'
  ): void {
    imageType === 'primary'
      ? (this.primaryPhoto.photoLink = event.base64 ?? undefined)
      : (this.secondaryPhoto.photoLink = event.base64 ?? undefined);

    if (imageType === 'primary' && this.primaryPhoto.photoLink) {
      this.adminForm?.controls.logoStep.controls.schoolLogoPrimary.setValue({
        url: this.primaryPhoto.photoLink,
        filename: this.primaryPhoto.photoName,
      });
    }

    if (imageType === 'secondary' && this.secondaryPhoto.photoLink) {
      this.adminForm?.controls.logoStep.controls.schoolLogoSecondary.setValue({
        url: this.secondaryPhoto.photoLink,
        filename: this.secondaryPhoto.photoName,
      });
    }
  }

  /**
   * Lesson Types
   */

  addLessonType(name: string, shortName: string): void {
    if (this.lessonTypesModified.length >= 5) {
      this.snackbarService.queueBar(
        'warn',
        'Sorry, you can only have a maximum of 5 class types.'
      );
    } else if (!name || !shortName) {
      this.snackbarService.queueBar(
        'warn',
        'Please enter a name and abbreviated name for your lesson'
      );
    } else if (name.length > 35) {
      this.snackbarService.queueBar(
        'warn',
        'Your long lesson name cannot be more than 35 characters.'
      );
    } else if (shortName.length > 10) {
      this.snackbarService.queueBar(
        'warn',
        'Your abbreviated lesson name cannot be more than 10 characters.'
      );
    } else if (
      this.lessonTypesModified
        .map((lesson) => lesson.name.toLocaleLowerCase())
        .includes(name.toLocaleLowerCase())
    ) {
      this.snackbarService.queueBar('warn', 'Lesson name must be unique.');
    } else if (
      this.lessonTypesModified
        .map((lesson) => lesson.shortName.toLocaleLowerCase())
        .includes(shortName.toLocaleLowerCase())
    ) {
      this.snackbarService.queueBar(
        'warn',
        'Abbreviated lesson name must be unique.'
      );
    } else {
      this.lessonTypesModified.push({ name, shortName });
      this.editLessonTypes = true;
    }
  }

  removeLessonType(name: string, shortName: string): void {
    if (this.lessons) {
      const upcomingLessonTypes = this.lessons.map((lesson) =>
        lesson.type.name.toLocaleLowerCase()
      );
      if (upcomingLessonTypes.includes(name.toLocaleLowerCase())) {
        this.snackbarService.queueBar(
          'warn',
          'Unable to delete lesson type: There is an upcoming scheduled lesson that uses this lesson type. In order to delete this lesson type, you must wait for the lesson to finish, or delete all upcoming lessons that use this type.'
        );
      } else {
        this.lessonTypesModified = this.lessonTypesModified.filter(
          (item) => !(item.name === name && item.shortName === shortName)
        );
        this.editLessonTypes = true;
      }
    }
  }

  updateLessonsClick(): void {
    this.saveSchoolDetails.emit({
      key: 'lessonTypes',
      value: this.lessonTypesModified,
    });
  }
}

export interface AdminSettingRow {
  dataRef:
    | 'nameInput'
    | 'emailInput'
    | 'countryInput'
    | 'phoneNumberInput'
    | 'addressInput'
    | 'descriptionInput'
    | 'passwordInput'
    | 'passwordMatchInput';
  tooltip: string;
  title: string;
  key: string;
  formType?: string | null;
  hide?: boolean | null;
}

export interface AdminStylesRow {
  dataRef:
    | 'primaryButtonBackgroundColor'
    | 'primaryButtonTextColor'
    | 'errorColor'
    | 'warnColor';
  tooltip: string;
  title: string;
  key: string;
  formType?: string | null;
  hide?: boolean | null;
}

export interface AdminBackgroundRow {
  dataRef:
    | 'backgroundImageInput'
    | 'backgroundGradientColor1'
    | 'backgroundGradientColor2'
    | 'backgroundGradientSlider'
    | 'backgroundGradientRotation'
    | 'backgroundGradientType';
  tooltip: string;
  title: string;
  key: string;
  formType?: string | null;
  hide?: boolean | null;
}

export interface LogoRow {
  dataRef: 'schoolLogoPrimary' | 'schoolLogoSecondary';
  tooltip: string;
  title: string;
  key: string;
  formType?: string | null;
  hide?: boolean | null;
}

export interface LessonsRow {
  dataRef: 'lessons';
  tooltip: string;
  title: string;
  key: string;
  formType?: string | null;
  hide?: boolean | null;
}
