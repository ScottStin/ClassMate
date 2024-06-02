import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { HomeworkDTO } from 'src/app/shared/models/homework.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-create-homework-dialog',
  templateUrl: './create-homework-dialog.component.html',
  styleUrls: ['./create-homework-dialog.component.css'],
})
export class CreateHomeworkDialogComponent implements OnInit {
  homeworkForm: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    dueDate: FormControl<string | null>;
    attempts: FormControl<number | null>;
    assignedTeacher: FormControl<string>;
    studentsInput: FormControl<string>;
    duration: FormControl<number>;
    attachment: FormControl<{ url: string; fileName: string } | null>;
  }>;
  formPopulated = new Subject<boolean>();
  compulsoryHomework = false;
  unlimitedAttempts = true;

  filteredStudents: UserDTO[];
  studentsList: UserDTO[] = [];

  fileChangedEvent: Event | string = '';
  fileLink: string | null | undefined;
  fileName: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      body: HomeworkDTO | undefined;
      teachers: UserDTO[];
      students: UserDTO[];
      currentSchool: SchoolDTO;
      primaryButtonBackgroundColor: string;
    },
    public dialogRef: MatDialogRef<CreateHomeworkDialogComponent>,
    private readonly snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.populateForm();
    this.filteredStudents = [...this.data.students];
  }

  closeDialog(save?: boolean): void {
    if (save === false || save === undefined) {
      this.dialogRef.close();
    } else if (
      this.data.currentSchool._id !== null &&
      this.data.currentSchool._id !== undefined
    ) {
      const homeworkForm = this.homeworkForm.getRawValue();
      let attachment = null;
      if (this.fileName && this.fileLink !== null && this.fileLink !== '') {
        attachment = { url: this.fileLink, fileName: this.fileName };
      }
      const homework: HomeworkDTO = {
        ...homeworkForm,
        attachment: attachment as { url: string; fileName: string },
        schoolId: this.data.currentSchool._id,
        students: this.studentsList
          .map((student) => ({
            studentId: student._id ?? '',
            completed: false,
          }))
          .filter((element) => element.studentId !== ''),
      };

      this.dialogRef.close(homework);
    } else {
      this.snackbarService.openPermanent(
        'error',
        'Error creating homework exercise. Please try again.',
        'dismiss'
      );
    }
  }

  populateForm(): void {
    const maxDescriptionLength = 100;
    const maxNameLength = 50;
    this.homeworkForm = new FormGroup({
      name: new FormControl(this.data.body?.name ?? '', {
        validators: [Validators.required, Validators.maxLength(maxNameLength)],
        nonNullable: true,
      }),
      description: new FormControl(this.data.body?.description ?? '', {
        validators: [
          Validators.required,
          Validators.maxLength(maxDescriptionLength),
        ],
        nonNullable: true,
      }),
      dueDate: new FormControl(this.data.body?.dueDate ?? '', {
        validators: [this.dateValidator()],
        nonNullable: false,
      }),
      attempts: new FormControl(this.data.body?.attempts ?? null, {
        validators: [this.attemptsValidator()],
        nonNullable: true,
      }),
      duration: new FormControl(this.data.body?.duration ?? NaN, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      assignedTeacher: new FormControl('', {
        validators: [],
        nonNullable: true,
      }),
      studentsInput: new FormControl('', {
        validators: [],
        nonNullable: true,
      }),
      attachment: new FormControl(this.data.body?.attachment ?? null, {
        validators: [],
        nonNullable: false,
      }),
    });
    this.formPopulated.next(true);
  }

  filterStudents(search: string): void {
    this.filteredStudents = this.data.students.filter(
      (obj: UserDTO) =>
        obj.name.toLowerCase().includes(search.toLowerCase()) &&
        !this.studentsList.includes(obj)
    );
  }

  updateStudents(student: UserDTO): void {
    this.studentsList.push(student);
    this.studentsList.sort((a: UserDTO, b: UserDTO) =>
      a.name.localeCompare(b.name)
    );
    this.homeworkForm.get('studentsInput')?.setValue('');
  }

  removeStudent(student: UserDTO): void {
    const index = this.studentsList.indexOf(student);
    if (index >= 0) {
      this.studentsList.splice(index, 1);
    }
    this.studentsValidator();
  }

  selectAllStudents(students: UserDTO[]): void {
    const newStudents = students.filter(
      (student) => !this.studentsList.some((obj) => obj._id === student._id)
    );
    this.studentsList.push(...newStudents);
    this.studentsList.sort((a: UserDTO, b: UserDTO) =>
      a.name.localeCompare(b.name)
    );
  }

  unselectAllStudents(): void {
    this.studentsList = [];
  }

  dateValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const value = control.value as string;
      if (new Date().getTime() > new Date(value).getTime()) {
        return { oldDate: control.value };
      } else if (!value) {
        if (this.compulsoryHomework) {
          return { required: control.value };
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }

  attemptsValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const value = control.value as number;
      if (value < 1 && !this.unlimitedAttempts) {
        return { lessThanOne: control.value };
      } else if (!value) {
        if (!this.unlimitedAttempts) {
          return { required: control.value };
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }

  studentsValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      if (this.studentsList.length === 0) {
        return { required: control.value };
      } else {
        return null;
      }
    };
  }

  fileChangeEvent(event: Event): void {
    this.fileChangedEvent = event;
    const input = event.target as HTMLInputElement;
    if (input.files) {
      if (this.validateFile(input.files[0])) {
        this.fileName = input.files[0].name;
        this.convertFileToBase64(input.files[0]);
      }
    }
  }

  convertFileToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = (): void => {
      this.fileLink = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  validateFile(file: File): boolean {
    // todo = move to shared service or directive
    const types = [
      'image/png',
      'image/gif',
      'image/tiff',
      'image/jpeg',
      'application/pdf',
      'application/msword',
    ];
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const maxSize = 1000 * 1024; // 1000 KB
    if (!types.includes(file.type)) {
      this.snackbarService.openPermanent(
        'error',
        'File must be an either a png, gif, tiff, jpeg, pdf, or ms-word doc type',
        'dismiss'
      );
      return false;
    }
    if (file.size > maxSize) {
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
