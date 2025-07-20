import { Component, Inject, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { LessonDTO, LessonTypeDTO } from 'src/app/shared/models/lesson.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CreateLessonFormComponent } from '../create-lesson-dialog/create-lesson-form/create-lesson-form.component';

@Component({
  selector: 'app-edit-lesson-dialog',
  templateUrl: './edit-lesson-dialog.component.html',
  styleUrls: ['./edit-lesson-dialog.component.scss'],
})
export class EditLessonDialogComponent {
  @ViewChild(CreateLessonFormComponent)
  createLessonFormComponent?: CreateLessonFormComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      lesson: LessonDTO;
      currentUser: UserDTO;
      teachers: UserDTO[];
      lessonTypes: LessonTypeDTO[];
    },
    private readonly dialogRef: MatDialogRef<EditLessonDialogComponent>,
    public dialog: MatDialog
  ) {}

  closeDialog(result: boolean): void {
    const formValue = this.createLessonFormComponent?.lessonForm.value;

    if (result) {
      this.dialogRef.close(formValue);
      return;
    }

    if (
      !this.createLessonFormComponent?.lessonForm.dirty ||
      !this.createLessonFormComponent.lessonForm.touched
    ) {
      this.dialogRef.close(result);
      return;
    }

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Close Edit Lesson Form?',
        message: 'Changes will be unsaved. Are you sure?',
        okLabel: 'Close',
        cancelLabel: 'Cancel',
      },
    });

    confirmDialogRef.afterClosed().subscribe((confirmDialogResult: boolean) => {
      if (confirmDialogResult) {
        this.dialogRef.close(null);
      }
    });
  }
}
