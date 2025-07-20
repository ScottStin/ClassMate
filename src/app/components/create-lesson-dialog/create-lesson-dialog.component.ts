import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import {
  CreateLessonDTO,
  LessonDTO,
  LessonTypeDTO,
} from 'src/app/shared/models/lesson.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { LessonFormValue } from './create-lesson-form/create-lesson-form.component';

@Component({
  selector: 'app-create-lesson-dialog',
  templateUrl: './create-lesson-dialog.component.html',
  styleUrls: ['./create-lesson-dialog.component.scss'],
})
export class CreateLessonDialogComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<CreateLessonDTO>;

  lessonFormValue?: LessonFormValue;
  lessonTypes: LessonTypeDTO[] = [];
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
  public lessonDateMode: 'individual' | 'scheduled';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      body?: LessonDTO;
      currentUser?: UserDTO;
      currentSchool?: SchoolDTO;
      teachers: UserDTO[];
    },
    public dialogRef: MatDialogRef<CreateLessonDialogComponent>,
    public dialog: MatDialog,
    private readonly snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.lessonTypes = this.data.currentSchool?.lessonTypes ?? [];
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

  addNewLessonRow(lessonFormValue: LessonFormValue): void {
    this.lessonFormValue = lessonFormValue;

    if (this.lessonDateMode === 'individual') {
      this.pushLessonToList(undefined);
    }

    if (this.lessonDateMode === 'scheduled') {
      const lessonDateList = this.generateCronDates(
        this.lessonFormValue.cronForm,
        this.lessonFormValue.cyclesInput
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
    const formValue = this.lessonFormValue;

    if (
      !formValue?.dateInput ||
      !formValue.typeInput ||
      (!formValue.dateInput && !startTime)
    ) {
      this.snackbarService.queueBar(
        'error',
        `Failed to add lessons: form incomplete`,
        {
          label: `retry`,
          registerAction: (onAction: Observable<void>) =>
            onAction.pipe(untilDestroyed(this)).subscribe(() => {
              this.pushLessonToList(startTime);
            }),
        }
      );
      return;
    }

    if (this.data.currentSchool && this.data.currentUser) {
      const userId = this.data.currentUser._id;

      this.lessons?.push({
        teacherId:
          this.data.currentUser.userType.toLocaleLowerCase() !== 'school'
            ? userId
            : formValue.assignedTeacherId,
        startTime: startTime ?? formValue.dateInput,
        maxStudents: formValue.sizeInput,
        type: formValue.typeInput,
        schoolId: this.data.currentSchool._id,
        level: formValue.levelInput,
        name: formValue.nameInput,
        duration: formValue.lengthInput,
        description: formValue.descriptionInput,
        disableFirtsLesson: false,
        studentsEnrolledIds: [],
        casualPrice: 0,
      }); // TODO - move this logic to CreateLessonForm to avoid repeating in update and edit lesson functionality
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

  onFormTypeChange(val: 'individual' | 'scheduled'): void {
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
  parseCronExpression(cronValue = '0 0 0 ? * MON *'): CronObject {
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
