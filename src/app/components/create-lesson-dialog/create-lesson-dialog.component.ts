/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { CronOptions } from 'ngx-cron-editor';
import { Subject } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { demoLevels } from 'src/app/shared/demo-data';
import {
  CreateLessonDTO,
  LessonTypeDTO,
} from 'src/app/shared/models/lesson.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { LevelDTO, UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-create-lesson-dialog',
  templateUrl: './create-lesson-dialog.component.html',
  styleUrls: ['./create-lesson-dialog.component.scss'],
})
export class CreateLessonDialogComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<CreateLessonDTO>;

  lessonForm: FormGroup<{
    nameInput: FormControl<string>;
    descriptionInput: FormControl<string>;
    dateInput: FormControl<string | null>;
    cronForm: FormControl<string>;
    cyclesInput: FormControl<number>;
    typeInput: FormControl<LessonTypeDTO | null>;
    sizeInput: FormControl<number>;
    lengthInput: FormControl<number>;
    levelInput: FormControl<LevelDTO[]>;
    assignedTeacher: FormControl<string>;
  }>;

  public cronOptions: CronOptions = {
    defaultTime: '00:00:00',
    hideMinutesTab: true,
    hideHourlyTab: true,
    hideDailyTab: true,
    hideWeeklyTab: false,
    hideMonthlyTab: true,
    hideYearlyTab: true,
    hideAdvancedTab: true,
    hideSpecificWeekDayTab: false,
    hideSpecificMonthWeekTab: false,
    use24HourTime: true,
    hideSeconds: true,
    cronFlavor: 'quartz', // standard or quartz
  };

  formPopulated = new Subject<boolean>();
  lessonTypes: LessonTypeDTO[] = [];
  demoLevels = demoLevels;
  lessons: CreateLessonDTO[] | undefined = [];
  displayedColumns = [
    'startTime',
    'name',
    'description',
    'duration',
    'maxStudents',
    'type',
    'level',
    'actions',
  ];
  dataSource?: MatTableDataSource<CreateLessonDTO> | undefined;
  public lessonDateMode: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      body: CreateLessonDTO | undefined;
      currentUser?: UserDTO;
      currentSchool?: SchoolDTO;
      teachers: UserDTO[];
    },
    public dialogRef: MatDialogRef<CreateLessonDialogComponent>,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.lessonTypes = this.data.currentSchool?.lessonTypes ?? [];
    this.populateForm();
    this.dataSource = new MatTableDataSource<CreateLessonDTO>(
      this.lessons ?? []
    );
    this.lessonDateMode = 'individual';
  }

  ngAfterViewInit(): void {
    this.updateTable();
  }

  updateTable(): void {
    if (this.dataSource && this.lessons && this.lessons.length > 0) {
      this.dataSource.data = this.lessons;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.table.dataSource = this.dataSource;
      this.dataSource.sortingDataAccessor =
        this.lessonSortingDataAccessor.bind(this);
    }
  }

  private lessonSortingDataAccessor(
    tableData: CreateLessonDTO,
    property: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    switch (property) {
      case 'startTime':
        return tableData.startTime;
      case 'name':
        return tableData.name;
      case 'description':
        return tableData.description;
      case 'duration':
        return tableData.duration;
      case 'maxStudents':
        return tableData.maxStudents;
      case 'type':
        return tableData.type;
      case 'level':
        return tableData.level;
      default:
        return '';
    }
  }

  populateForm(): void {
    const maxDescriptionLength = 200;
    const maxNameLength = 50;
    this.lessonForm = new FormGroup({
      nameInput: new FormControl(this.data.body?.name ?? '', {
        validators: [Validators.required, Validators.maxLength(maxNameLength)],
        nonNullable: true,
      }),
      descriptionInput: new FormControl(this.data.body?.description ?? '', {
        validators: [
          Validators.required,
          Validators.maxLength(maxDescriptionLength),
        ],
        nonNullable: true,
      }),
      dateInput: new FormControl(this.data.body?.startTime ?? '', {
        validators: [this.dateValidator()],
        nonNullable: false,
      }),
      cronForm: new FormControl('0 0 1/1 * *', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      cyclesInput: new FormControl(NaN, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      typeInput: new FormControl(this.data.body?.type ?? null, {
        validators: [Validators.required],
        nonNullable: false,
      }),
      sizeInput: new FormControl(this.data.body?.maxStudents ?? NaN, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      lengthInput: new FormControl(this.data.body?.duration ?? NaN, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      levelInput: new FormControl(this.data.body?.level ?? [], {
        validators: [Validators.required],
        nonNullable: true,
      }),
      assignedTeacher: new FormControl('', {
        validators: [],
        nonNullable: true,
      }),
    });
    this.formPopulated.next(true);
  }

  addNewLessonRow(): void {
    if (this.lessonDateMode === 'individual') {
      this.pushLessonToList(undefined);
    }

    if (this.lessonDateMode === 'scheduled') {
      const lessonDateList = this.generateCronDates(
        this.lessonForm.getRawValue().cronForm,
        this.lessonForm.getRawValue().cyclesInput
      );

      for (const lessonDate of lessonDateList) {
        this.pushLessonToList(lessonDate.toString());
      }
    }
    if (this.dataSource && this.lessons && this.lessons.length > 0) {
      this.updateTable();
    }
  }

  pushLessonToList(startTime: string | undefined): void {
    if (this.data.currentSchool && this.data.currentUser) {
      const userId = this.data.currentUser._id;
      const formValue = this.lessonForm.getRawValue();

      this.lessons?.push({
        teacherId:
          this.data.currentUser.userType.toLocaleLowerCase() !== 'school'
            ? userId
            : this.lessonForm.controls.assignedTeacher.value,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        startTime: startTime ?? formValue.dateInput!,
        maxStudents: formValue.sizeInput,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        type: formValue.typeInput!,
        schoolId:
          this.data.currentSchool._id !== undefined &&
          this.data.currentSchool._id !== null
            ? this.data.currentSchool._id
            : '',
        level: formValue.levelInput,
        name: formValue.nameInput,
        duration: formValue.lengthInput,
        description: formValue.descriptionInput,
        disableFirtsLesson: false,
        studentsEnrolledIds: [],
        casualPrice: 0,
      });
    }
  }

  removeLesson(lesson: CreateLessonDTO): void {
    if (this.lessons) {
      const index = this.lessons.indexOf(lesson);
      if (index !== -1) {
        this.lessons.splice(index, 1);
      }
    }
    this.updateTable();
  }

  onFormTypeChange(val: string): void {
    this.lessonDateMode = val;
    this.dateValidator();
  }

  dateValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const value = control.value as string;
      if (this.lessonDateMode === 'individual') {
        if (new Date().getTime() > new Date(value).getTime()) {
          return { oldDate: control.value };
        } else if (!value) {
          return { required: control.value };
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }

  closeDialog(): void {
    if (this.lessons === undefined || this.lessons.length === 0) {
      this.dialogRef.close();
    } else {
      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: `Close New Lesson Form`,
          message: `Your new lessons haven't been saved yet. Are you sure you want to close this form?`,
          okLabel: `Close`,
          cancelLabel: `Cancel`,
          routerLink: '',
        },
      });
      confirmDialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          this.dialogRef.close();
        }
      });
    }
  }

  saveClick(lessons: CreateLessonDTO[] | undefined): void {
    this.dialogRef.close(lessons);
  }

  // TODO: move to shared service or directive:
  parseCronExpression(cronValue: string): CronObject {
    const [second, minute, hour, dayOfMonth, month, dayOfWeek] = cronValue
      .split(' ')
      .map((val) => val.trim());

    return {
      second: parseInt(second, 10),
      minute: parseInt(minute, 10),
      hour: parseInt(hour, 10),
      dayOfMonth: dayOfMonth === '?' ? null : parseInt(dayOfMonth, 10),
      month: month === '*' ? null : parseInt(month, 10),
      dayOfWeek:
        dayOfWeek === '*'
          ? []
          : dayOfWeek
              .split(',')
              .map((day) => {
                switch (day.toUpperCase()) {
                  case 'SUN':
                    return 0;
                  case 'MON':
                    return 1;
                  case 'TUE':
                    return 2;
                  case 'WED':
                    return 3;
                  case 'THU':
                    return 4;
                  case 'FRI':
                    return 5;
                  case 'SAT':
                    return 6;
                  default:
                    return -1;
                }
              })
              .filter((day) => day >= 0), // Filter out invalid day values
    };
  }

  // TODO: move to shared service or directive:
  generateCronDates(cronValue: string, periodWeeks: number): Date[] {
    const cron = this.parseCronExpression(cronValue);
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + periodWeeks * 7);

    const resultDates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (cron.dayOfWeek.includes(currentDate.getDay())) {
        resultDates.push(
          new Date(new Date(currentDate).setHours(cron.hour, cron.minute, 0, 0))
        );
      }
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    return resultDates;
  }
}

interface CronObject {
  second: number;
  minute: number;
  hour: number;
  dayOfMonth: number | null;
  month: number | null;
  dayOfWeek: number[];
}
