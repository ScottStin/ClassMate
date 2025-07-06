import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
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
import { Subject } from 'rxjs';
import { ImageService } from 'src/app/services/image-service/image.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { CreateHomeworkDTO } from 'src/app/shared/models/homework.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

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
    assignedTeacherId: FormControl<string>;
    studentsInput: FormControl<string>;
    duration: FormControl<number>;
    attachment: FormControl<{ url: string; fileName: string } | null>;
  }>;
  formPopulated = new Subject<boolean>();
  compulsoryHomework = false;
  limitAttempts = false;

  filteredStudents: UserDTO[];
  studentsList: UserDTO[] = [];

  fileChangedEvent: Event | string = '';
  fileLink: string | null | undefined;
  fileName: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      body: CreateHomeworkDTO | undefined;
      teachers: UserDTO[];
      students?: UserDTO[];
      currentSchool: SchoolDTO;
      primaryButtonBackgroundColor: string;
    },
    public dialogRef: MatDialogRef<CreateHomeworkDialogComponent>,
    private readonly snackbarService: SnackbarService,
    private readonly cdr: ChangeDetectorRef,
    readonly imageService: ImageService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.populateForm();
    if (this.data.students) {
      this.filteredStudents = [...this.data.students];
    }
  }

  closeDialog(save?: boolean): void {
    if (save === false || save === undefined) {
      this.dialogRef.close();
    } else if (this.data.currentSchool._id) {
      const homeworkForm = this.homeworkForm.getRawValue();
      let attachment = null;
      if (this.fileName && this.fileLink !== null && this.fileLink !== '') {
        attachment = { url: this.fileLink, fileName: this.fileName };
      }
      const homework: CreateHomeworkDTO = {
        ...homeworkForm,
        attachment: attachment as { url: string; fileName: string },
        schoolId: this.data.currentSchool._id,
        students: this.studentsList
          .map((student) => ({
            studentId: student._id,
            completed: false,
          }))
          .filter((element) => element.studentId !== ''),
      };

      this.dialogRef.close(homework);
    } else {
      this.snackbarService.queueBar(
        'error',
        'Error creating homework exercise. Please try again.'
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
      assignedTeacherId: new FormControl(
        this.data.body?.assignedTeacherId ?? '',
        {
          validators: [],
          nonNullable: true,
        }
      ),
      studentsInput: new FormControl('', {
        validators: [],
        nonNullable: true,
      }),
      attachment: new FormControl(this.data.body?.attachment ?? null, {
        validators: [],
        nonNullable: false,
      }),
    });

    // --- get student list:
    if (this.data.body?.students && this.data.body.students.length > 0) {
      const assignedStudentIds = this.data.body.students.map(
        (obj) => obj.studentId
      );

      const filteredStudents = this.data.students?.filter((student) =>
        assignedStudentIds.includes(student._id as unknown as string)
      );
      this.studentsList = filteredStudents ?? [];
    }

    // --- assign toggle values:
    if (this.data.body) {
      this.limitAttempts = this.data.body.attempts !== null;
      this.compulsoryHomework =
        this.data.body.dueDate !== null && this.data.body.dueDate !== '';
    }

    this.formPopulated.next(true);
  }

  filterStudents(search: string): void {
    this.filteredStudents =
      this.data.students?.filter(
        (obj: UserDTO) =>
          obj.name.toLowerCase().includes(search.toLowerCase()) &&
          !this.studentsList.includes(obj)
      ) ?? [];
  }

  onToggleChange(): void {
    this.cdr.detectChanges();
    if (!this.limitAttempts) {
      this.homeworkForm.get('attempts')?.setValue(null);
    }
    if (!this.compulsoryHomework) {
      this.homeworkForm.get('dueDate')?.setValue('');
    }
  }

  updateStudents(student: UserDTO): void {
    this.studentsList.push(student);
    this.studentsList.sort((a: UserDTO, b: UserDTO) =>
      a.name.localeCompare(b.name)
    );
    this.homeworkForm.get('studentsInput')?.setValue('');
  }

  removeStudent(student: UserDTO): void {
    const studentSubmissionAttempts = this.data.body?.comments?.filter(
      (comment) => comment.studentId === student._id
    );

    const studentSubmissionAttemptPass = studentSubmissionAttempts?.filter(
      (studentSubmissionAttempt) => studentSubmissionAttempt.pass
    );

    if (studentSubmissionAttempts && studentSubmissionAttempts.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: `Remove student from homework item?`,
          message: `${
            studentSubmissionAttemptPass &&
            studentSubmissionAttemptPass.length > 0
              ? 'This student has already completed this homework item.'
              : 'This student has already made submissions for this homework item.'
          } Are you sure you want to remove them? All their submissions will be permanently deleted. All attachments and feedback for this student will also be deleted.`,
          okLabel: 'Remove',
          cancelLabel: 'Cancel',
        },
      });
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          const index = this.studentsList.indexOf(student);
          if (index >= 0) {
            this.studentsList.splice(index, 1);
          }
          this.studentsValidator();
        }
      });
    } else {
      const index = this.studentsList.indexOf(student);
      if (index >= 0) {
        this.studentsList.splice(index, 1);
      }
      this.studentsValidator();
    }
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
    if (this.data.body?.comments && this.data.body.comments.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: `Remove student from homework item?`,
          message: `This homework exercise may already have submissions and feedback from students and teachers. Are you sure you want to remove all students? This will cause all student submissions to be permanently deleted. All teacher feedback will also be deleted.`,
          okLabel: 'Remove',
          cancelLabel: 'Cancel',
        },
      });
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.studentsList = [];
        }
      });
    } else {
      this.studentsList = [];
    }
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
      if (value < 1 && this.limitAttempts) {
        return { lessThanOne: control.value };
      } else if (!value) {
        if (this.limitAttempts) {
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

  async fileChangeEvent(event: Event): Promise<void> {
    this.fileChangedEvent = event;
    const input = event.target as HTMLInputElement;
    if (
      !input.files ||
      !this.imageService.validateFile(input.files[0], 'doc', 1000 * 1024)
    ) {
      return;
    }
    const file = input.files[0];
    this.fileName = file.name;
    try {
      this.fileLink = await this.imageService.convertToBase64(file);
    } catch (error) {
      this.snackbarService.queueBar(
        'error',
        'Error reading file. Please try again.'
      );
    }
  }
}
