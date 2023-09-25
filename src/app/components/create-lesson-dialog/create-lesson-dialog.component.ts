import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { LessonDTO } from 'src/app/shared/models/lesson.model';

@Component({
  selector: 'app-create-lesson-dialog',
  templateUrl: './create-lesson-dialog.component.html',
  styleUrls: ['./create-lesson-dialog.component.css'],
})
export class CreateLessonDialogComponent implements OnInit {
  lessonForm!: FormGroup<{
    nameInput: FormControl<string>;
    dateInput: FormControl<string>;
    typeInput: FormControl<string[]>;
    timeInput: FormControl<string>;
    sizeInput: FormControl<number>;
    lengthInput: FormControl<number>;
    levelInput: FormControl<string>;
    descriptionInput: FormControl<string>;
  }>;

  formPopulated = new Subject<boolean>();

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
    // this.populateForm();
  }

  // populateForm(): void {
  //   this.lessonForm = new FormGroup({
  //     nameInput: new FormControl(this.data.body?.name ?? '', {
  //       validators: [Validators.required],
  //       nonNullable: true,
  //     }),
  //   });
  //   this.formPopulated.next(true);
  // }
}
