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
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { CronOptions } from 'ngx-cron-editor';
import { Subject } from 'rxjs';
import { demoLessonTypes, demoLevels } from 'src/app/shared/demo-data';
import { LessonDTO, LessonTypeDTO } from 'src/app/shared/models/lesson.model';

@Component({
  selector: 'app-create-lesson-dialog',
  templateUrl: './create-lesson-dialog.component.html',
  styleUrls: ['./create-lesson-dialog.component.scss'],
})
export class CreateLessonDialogComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<LessonDTO>;

  lessonForm: FormGroup<{
    nameInput: FormControl<string>;
    descriptionInput: FormControl<string>;
    dateInput: FormControl<string | null>;
    cronForm: FormControl<string>;
    cyclesInput: FormControl<number>;
    typeInput: FormControl<LessonTypeDTO | null>;
    sizeInput: FormControl<number>;
    lengthInput: FormControl<number>;
    levelInput: FormControl<string[]>;
  }>;

  public cronOptions: CronOptions = {
    defaultTime: '00:00:00',
    hideMinutesTab: true,
    hideHourlyTab: true,
    hideDailyTab: false,
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
  demoLessonTypes = demoLessonTypes;
  demoLevels = demoLevels;
  lessons: LessonDTO[] | undefined = [];
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
  dataSource?: MatTableDataSource<LessonDTO> | undefined;
  public lessonDateMode: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      rightButton: string;
      leftButton: string;
      body: LessonDTO | undefined;
    }
  ) {}

  ngOnInit(): void {
    this.populateForm();
    this.dataSource = new MatTableDataSource<LessonDTO>(this.lessons ?? []);
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
    tableData: LessonDTO,
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
    const maxDescriptionLength = 100;
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
    });
    this.formPopulated.next(true);
  }

  addNewLessonRow(): void {
    const formValue = this.lessonForm.getRawValue();
    console.log(formValue.cronForm);
    this.lessons?.push({
      teacher: 'elvispresley@gmail.com',
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      startTime: formValue.dateInput!,
      maxStudents: formValue.sizeInput,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      type: formValue.typeInput!,
      level: formValue.levelInput,
      name: formValue.nameInput,
      duration: formValue.lengthInput,
      description: formValue.descriptionInput,
      disableFirtsLesson: false,
      studentsEnrolled: [],
      casualPrice: 0,
    });
    if (this.dataSource && this.lessons && this.lessons.length > 0) {
      this.updateTable();
    }
  }

  removeLesson(lesson: LessonDTO): void {
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
}
