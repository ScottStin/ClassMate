import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CronOptions } from 'ngx-cron-editor';
import { Subject } from 'rxjs';
import { demoLevels } from 'src/app/shared/demo-data';
import { LessonDTO, LessonTypeDTO } from 'src/app/shared/models/lesson.model';
import { LevelDTO, UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-create-lesson-form',
  templateUrl: './create-lesson-form.component.html',
  styleUrls: ['./create-lesson-form.component.scss'],
})
export class CreateLessonFormComponent implements OnInit {
  @Input() existingLesson?: LessonDTO;
  @Input() lessonDateMode: 'individual' | 'scheduled';
  @Input() lessonTypes: LessonTypeDTO[];
  @Input() currentUser?: UserDTO;
  @Input() teachers: UserDTO[];
  @Input() isEditLesson?: boolean;
  @Output() addNewLessonRow = new EventEmitter<LessonFormValue>();

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
    assignedTeacherId: FormControl<string>;
  }>;
  formPopulated = new Subject<boolean>();
  demoLevels = demoLevels; // TODO - replace this.

  ngOnInit(): void {
    this.populateForm();
  }

  populateForm(): void {
    const maxDescriptionLength = 200;
    const maxNameLength = 50;
    this.lessonForm = new FormGroup({
      nameInput: new FormControl(this.existingLesson?.name ?? '', {
        validators: [Validators.required, Validators.maxLength(maxNameLength)],
        nonNullable: true,
      }),
      descriptionInput: new FormControl(
        this.existingLesson?.description ?? '',
        {
          validators: [
            Validators.required,
            Validators.maxLength(maxDescriptionLength),
          ],
          nonNullable: true,
        }
      ),
      dateInput: new FormControl(this.existingLesson?.startTime ?? '', {
        validators: [this.dateValidator()],
        nonNullable: false,
      }),
      cronForm: new FormControl('0 0 0 ? * MON *', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      cyclesInput: new FormControl(1, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      typeInput: new FormControl(this.existingLesson?.type ?? null, {
        validators: [Validators.required],
        nonNullable: false,
      }),
      sizeInput: new FormControl(this.existingLesson?.maxStudents ?? NaN, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      lengthInput: new FormControl(this.existingLesson?.duration ?? NaN, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      levelInput: new FormControl(this.existingLesson?.level ?? [], {
        validators: [Validators.required],
        nonNullable: true,
      }),
      assignedTeacherId: new FormControl('', {
        validators: [],
        nonNullable: true,
      }),
    });

    if (!this.existingLesson) {
      this.formPopulated.next(true);
      return;
    }

    // set type if edit form:
    const type = this.lessonTypes.find(
      (lessonType) => lessonType.name === this.existingLesson?.type.name
    );
    if (type) {
      this.lessonForm.controls.typeInput.setValue(type);
    }

    // select levels if edit form:
    const selectedLevels = this.existingLesson.level
      .map((existing) =>
        this.demoLevels.find((level) => level.number === existing.number)
      )
      .filter((level): level is LevelDTO => !!level);

    if (selectedLevels.length > 0) {
      this.lessonForm.controls.levelInput.setValue(selectedLevels);
    }

    this.formPopulated.next(true);
  }

  // todo - move to service
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

  addNewLessonRowClick(): void {
    this.addNewLessonRow.emit(this.lessonForm.getRawValue());
  }
}

export interface LessonFormValue {
  nameInput: string;
  descriptionInput: string;
  dateInput: string | null;
  cronForm: string;
  cyclesInput: number;
  typeInput: LessonTypeDTO | null;
  sizeInput: number;
  lengthInput: number;
  levelInput: LevelDTO[];
  assignedTeacherId: string;
}
