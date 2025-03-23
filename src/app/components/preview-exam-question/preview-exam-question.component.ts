import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { CreateExamQuestionDto } from 'src/app/shared/models/question.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-preview-exam-question',
  templateUrl: './preview-exam-question.component.html',
  styleUrls: ['./preview-exam-question.component.css'],
})
export class PreviewExamQuestionComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      question: CreateExamQuestionDto;
      placeholderUser: UserDTO;
    },
    private readonly dialogRef: MatDialogRef<PreviewExamQuestionComponent>,
    public dialog: MatDialog
  ) {}

  closeDialog(result: boolean | null): void {
    this.dialogRef.close(result);
  }
}
