import {
  Component,
  EventEmitter,
  Input,
  NgIterable,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import {
  BackgroundStep,
  DetailStep,
  FormatStep,
  LessonStep,
  LogoStep,
} from 'src/app/components/login-card-school/login-card-school.component';
import { TempStylesDTO } from 'src/app/services/temp-styles-service/temp-styles-service.service';
import { BackgroundImageDTO } from 'src/app/shared/background-images';
import { countryList } from 'src/app/shared/country-list';
import { defaultStyles } from 'src/app/shared/default-styles';
import { SchoolDTO } from 'src/app/shared/models/school.model';

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css'],
})
export class AdminViewComponent implements OnInit {
  @Input() primaryButtonBackgroundColor: string;
  @Input() primaryButtonTextColor: string;
  @Input() selectedBackgroundImage: BackgroundImageDTO;
  @Input() adminPageLoading: boolean;
  @Input() currentSchool: SchoolDTO | null;
  @Output() saveSchoolDetails = new EventEmitter<{
    key: string;
    value: string;
  }>();
  @Output() updateTempStyles = new EventEmitter<TempStylesDTO | null>();

  countryList = countryList;
  defaultStyles = defaultStyles;
  edit: AdminSettingRow | AdminStylesRow | null = null;

  readonly tabs: {
    title: string;
    form: 'detailStep' | 'formatStep' | 'backgroundStep';
    // | 'logoStep'
    // | 'lessonStep'
    // | 'paymentStep'
    // | 'infoStep';
    formValues: NgIterable<AdminSettingRow | AdminStylesRow> | null | undefined;
    // formValues: NgIterable<AdminSettingRow> | null | undefined;
  }[] = [
    {
      title: 'details',
      form: 'detailStep',
      formValues: [
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
        // Add other AdminSettingRow objects here
      ] as AdminSettingRow[],
    },
    {
      title: 'styles',
      form: 'formatStep',
      formValues: [
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
      ] as AdminStylesRow[],
    },
  ];

  // readonly dataRows: AdminSettingRow[] = [
  //   {
  //     dataRef: 'nameInput',
  //     tooltip: `The name of your school.`,
  //     title: `Name`,
  //     key: 'name',
  //   },
  //   {
  //     dataRef: 'emailInput',
  //     tooltip: `The admin email of your school. This will be used to log in and out and for students to contact you.`,
  //     title: `Email`,
  //     key: 'email',
  //   },
  //   {
  //     dataRef: 'countryInput',
  //     tooltip: `In what country is your school based?`,
  //     title: `Country`,
  //     key: 'nationality',
  //     formType: 'select',
  //   },
  //   {
  //     dataRef: 'phoneNumberInput',
  //     tooltip: `How can students contact you?`,
  //     title: `Phone`,
  //     key: 'phone',
  //   },
  //   {
  //     dataRef: 'addressInput',
  //     tooltip: `Where is your school located?`,
  //     title: `Address`,
  //     key: 'address',
  //   },
  //   {
  //     dataRef: 'descriptionInput',
  //     tooltip: `Tell your students a little but about your school...`,
  //     title: `Description`,
  //     key: 'description',
  //     formType: 'text-area',
  //   },
  //   {
  //     dataRef: 'passwordInput',
  //     tooltip: `Must have between 6-16 characters, at least one uppercase letter, at least one lowercase letter, one number and one special character.`,
  //     title: `Password`,
  //     key: 'password',
  //   },
  //   // {
  //   //   dataRef: 'passwordMatchInput',
  //   //   tooltip: `Must match your password above.`,
  //   //   title: `Confirm your password`,
  //   // },
  // ];

  // --- forms:
  adminForm: FormGroup<{
    detailStep: DetailStep;
    formatStep: FormatStep;
    backgroundStep: BackgroundStep;
    logoStep: LogoStep;
    lessonStep: LessonStep;
  }> | null = null;
  formPopulated = new Subject<boolean>();

  // constructor() {}

  ngOnInit(): void {
    // console.log(this.currentSchool);
    this.populateForm();
  }

  getFormControl(formGroup: FormGroup, dataRef: string): FormControl | null {
    return formGroup.controls[dataRef] as FormControl;
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
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          validators: [],
          nonNullable: true,
        }
      ),
      passwordInput: new FormControl(
        {
          value: this.currentSchool?.hasedPassword ?? '******',
          disabled: this.adminPageLoading,
        },
        {
          validators: [],
          nonNullable: true,
        }
      ),
      passwordMatchInput: new FormControl(
        {
          value: this.currentSchool?.unhashedPassword ?? '******',
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
        { value: '#FFFFFF', disabled: this.adminPageLoading },
        {
          validators: [],
          nonNullable: true,
        }
      ),
    });

    const backgroundStepForm: BackgroundStep = new FormGroup({
      backgroundImageInput: new FormControl(this.selectedBackgroundImage, {
        validators: [],
        nonNullable: false,
      }),
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

    // admin form group:
    this.adminForm = new FormGroup({
      detailStep: detailStepForm,
      formatStep: formatStepForm,
      backgroundStep: backgroundStepForm,
      logoStep: logoStepForm,
      lessonStep: lessonStepForm,
    });
  }

  openEdit(row: AdminSettingRow | AdminStylesRow): void {
    // this.updateTempStyles.emit(null);
    this.edit = row;
  }

  closeEdit(): void {
    this.edit = null;
    this.updateTempStyles.emit(null);
    this.populateForm();
  }

  onSaveClick(row: AdminSettingRow | AdminStylesRow, value: string): void {
    this.saveSchoolDetails.emit({ key: row.key, value });
  }

  changeSyleColors(feature: string, color: string): void {
    const tempStyles: TempStylesDTO = {};
    // tempStyles[feature] = color;
    if (feature.toLocaleLowerCase() === 'secondary color') {
      tempStyles.primaryButtonTextColor = color;
    }
    if (feature.toLocaleLowerCase() === 'primary color') {
      tempStyles.primaryButtonBackgroundColor = color;
    }
    this.updateTempStyles.emit(tempStyles);
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
}

export interface AdminStylesRow {
  dataRef: 'primaryButtonBackgroundColor' | 'primaryButtonTextColor';
  tooltip: string;
  title: string;
  key: string;
  formType?: string | null;
}
