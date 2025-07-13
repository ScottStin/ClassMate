import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { CreateExamQuestionDto } from 'src/app/shared/models/question.model';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-create-reorder-sentence-exam-question-dialog',
  templateUrl: './create-reorder-sentence-exam-question-dialog.component.html',
  styleUrls: ['./create-reorder-sentence-exam-question-dialog.component.css'],
})
export class CreateReorderSentenceExamQuestionDialogComponent
  implements OnInit
{
  positions = [
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'sixth',
    'seventh',
    'eighth',
    'ninth',
    'tenth',
  ]; // used for the order of the options;

  questionForm: FormGroup<{
    randomQuestionOrder: FormControl<boolean | null>; // for multiple choice question, the questions will be in random order
  }>;
  formChanged = false;
  temporarycurrentQuestionDisplay = JSON.parse(
    JSON.stringify(this.data.currentQuestionDisplay ?? {})
  ) as CreateExamQuestionDto; // used to hold the value of currentQuestionDisplay without modifying the original

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      currentQuestionDisplay?: CreateExamQuestionDto;
    },
    private readonly dialogRef: MatDialogRef<CreateReorderSentenceExamQuestionDialogComponent>,
    public dialog: MatDialog,
    private readonly snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.populateQuestionForm();
  }

  populateQuestionForm(): void {
    this.questionForm = new FormGroup({
      randomQuestionOrder: new FormControl(
        this.data.currentQuestionDisplay?.randomQuestionOrder ?? false,
        {
          nonNullable: false,
        }
      ),
    });
  }

  changeReorderSentenceText(index: number, text: string): void {
    if (this.temporarycurrentQuestionDisplay.reorderSentenceQuestionList) {
      this.temporarycurrentQuestionDisplay.reorderSentenceQuestionList[
        index
      ].text = text;
    }
    this.formChanged = true;
  }

  addReorderSentenceOption(): void {
    if (
      !this.temporarycurrentQuestionDisplay.reorderSentenceQuestionList ||
      this.temporarycurrentQuestionDisplay.reorderSentenceQuestionList.length <
        10
    ) {
      if (!this.temporarycurrentQuestionDisplay.reorderSentenceQuestionList) {
        this.temporarycurrentQuestionDisplay.reorderSentenceQuestionList = [
          { text: '' },
        ];
      } else {
        this.temporarycurrentQuestionDisplay.reorderSentenceQuestionList.push({
          text: '',
        });
      }
    } else {
      this.snackbarService.queueBar(
        'warn',
        'Maximum number of options reached. Please delete some options before adding more.'
      );
    }
  }

  removeSentenceOption(optionIndex: number): void {
    this.temporarycurrentQuestionDisplay.reorderSentenceQuestionList?.splice(
      optionIndex,
      1
    );
    this.formChanged = true;
  }

  togglePartialMarking(toggle: boolean): void {
    this.temporarycurrentQuestionDisplay.partialMarking = toggle;
    this.formChanged = true;
  }

  /**
   * Close dialog options:
   */
  closeDialog(): void {
    if (this.formChanged) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Close Reorder Sentence Form?',
          message: 'Changes will be unsaved. Are you sure?',
          okLabel: 'Close',
          cancelLabel: 'Cancel',
        },
      });
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.dialogRef.close(null);
        }
      });
    } else {
      this.dialogRef.close(null);
    }
  }

  closeDialogSave(): void {
    this.dialogRef.close(this.temporarycurrentQuestionDisplay);
  }
}
