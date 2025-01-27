import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { UserDTO } from 'src/app/shared/models/user.model';

import { QuestionList } from '../create-exam-dialog/create-exam-dialog.component';

@Component({
  selector: 'app-preview-exam-question',
  templateUrl: './preview-exam-question.component.html',
  styleUrls: ['./preview-exam-question.component.css'],
})
export class PreviewExamQuestionComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      question: QuestionList;
      placeholderUser: UserDTO;
    },
    private readonly dialogRef: MatDialogRef<PreviewExamQuestionComponent>,
    public dialog: MatDialog
  ) {}

  closeDialog(result: boolean | null): void {
    this.dialogRef.close(result);
  }
}
