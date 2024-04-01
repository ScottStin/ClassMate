import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import {
  BackgroundStep,
  DetailStep,
  FormatStep,
  LessonStep,
  LogoStep,
} from 'src/app/components/login-card-school/login-card-school.component';
import { BackgroundImageDTO } from 'src/app/shared/background-images';
import { countryList } from 'src/app/shared/country-list';
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

  countryList = countryList;
  edit: AdminSettingRow | null = null;

  // readonly tabs: { details: AdminSettingRow[]; styles: AdminStylesRow[] }[] = [
  //   {
  //     details: [
  //       {
  //         dataRef: 'nameInput',
  //         tooltip: `The name of your school.`,
  //         title: `Name`,
  //         key: 'name',
  //       },
  //       {
  //         dataRef: 'emailInput',
  //         tooltip: `The admin email of your school. This will be used to log in and out and for students to contact you.`,
  //         title: `Email`,
  //         key: 'email',
  //       },
  //       {
  //         dataRef: 'countryInput',
  //         tooltip: `In what country is your school based?`,
  //         title: `Country`,
  //         key: 'nationality',
  //         formType: 'select',
  //       },
  //       {
  //         dataRef: 'phoneNumberInput',
  //         tooltip: `How can students contact you?`,
  //         title: `Phone`,
  //         key: 'phone',
  //       },
  //       {
  //         dataRef: 'addressInput',
  //         tooltip: `Where is your school located?`,
  //         title: `Address`,
  //         key: 'address',
  //       },
  //       {
  //         dataRef: 'descriptionInput',
  //         tooltip: `Tell your students a little but about your school...`,
  //         title: `Description`,
  //         key: 'description',
  //         formType: 'text-area',
  //       },
  //       {
  //         dataRef: 'passwordInput',
  //         tooltip: `Must have between 6-16 characters, at least one uppercase letter, at least one lowercase letter, one number and one special character.`,
  //         title: `Password`,
  //         key: 'password',
  //       },
  //       // Add other AdminSettingRow objects here
  //     ],
  //     styles: [
  //       {
  //         dataRef: 'primaryColorInput',
  //         tooltip: `Must have between 6-16 characters, at least one uppercase letter, at least one lowercase letter, one number and one special character.`,
  //         title: `Password`,
  //         key: 'password',
  //       },
  //       {
  //         dataRef: 'secondaryColorInput',
  //         tooltip: `Must have between 6-16 characters, at least one uppercase letter, at least one lowercase letter, one number and one special character.`,
  //         title: `Password`,
  //         key: 'password',
  //       },
  //     ],
  //   },
  // ];

  readonly dataRows: AdminSettingRow[] = [
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
    // {
    //   dataRef: 'passwordMatchInput',
    //   tooltip: `Must match your password above.`,
    //   title: `Confirm your password`,
    // },
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

  // constructor() {}

  ngOnInit(): void {
    // console.log(this.currentSchool);
    this.populateForm();
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
        { value: '#6200EE', disabled: this.adminPageLoading },
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

  openEdit(row: AdminSettingRow): void {
    this.edit = row;
  }

  closeEdit(): void {
    this.edit = null;
    this.populateForm();
  }

  onSaveClick(row: AdminSettingRow, value: string): void {
    this.saveSchoolDetails.emit({ key: row.key, value });
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
  dataRef: 'primaryColorInput' | 'secondaryColorInput';
  tooltip: string;
  title: string;
  key: string;
  formType?: string | null;
}
