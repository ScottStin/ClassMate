import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ExamService } from 'src/app/services/exam-service/exam.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-create-exam-dialog',
  templateUrl: './create-exam-dialog.component.html',
  styleUrls: ['./create-exam-dialog.component.scss'],
})
export class CreateExamDialogComponent implements OnInit {
  error: Error;
  @Output() saveExam = new EventEmitter<ExamDTO>();
  examForm: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    casualPrice: FormControl<number>;
    default: FormControl<boolean>;
    assignedTeacher: FormControl<string>;
    defaultExam: FormControl<boolean>;
  }>;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      exam: ExamDTO | undefined;
      teachers: UserDTO[];
    },
    private readonly dialogRef: MatDialogRef<CreateExamDialogComponent>,
    private readonly examService: ExamService,
    private readonly snackbarService: SnackbarService
  ) {}

  formPopulated = new Subject<boolean>();

  ngOnInit(): void {
    this.populateForm();
  }

  populateForm(): void {
    this.examForm = new FormGroup({
      name: new FormControl(this.data.exam?.name ?? '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      description: new FormControl(this.data.exam?.description ?? '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      casualPrice: new FormControl(this.data.exam?.casualPrice ?? NaN, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      default: new FormControl(this.data.exam?.default ?? false, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      defaultExam: new FormControl(this.data.exam?.default ?? false, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      assignedTeacher: new FormControl(this.data.exam?.assignedTeacher ?? '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
    });
    this.formPopulated.next(true);
  }

  saveExamClick(): void {
    console.log(this.examForm);
    // this.saveExam.emit(this.examForm.value as ExamDTO);
    this.examService.create(this.examForm.value as ExamDTO).subscribe({
      next: () => {
        this.snackbarService.open('info', 'Exam successfully created');
        this.closeDialog(true);
      },
      error: (error: Error) => {
        this.error = error;
        this.snackbarService.openPermanent('error', error.message);
      },
    });
  }

  closeDialog(result: boolean | null): void {
    this.dialogRef.close(result);
  }
}
