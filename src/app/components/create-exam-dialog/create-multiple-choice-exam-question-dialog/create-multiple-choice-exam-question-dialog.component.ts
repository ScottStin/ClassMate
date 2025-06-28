/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { CreateExamQuestionDto } from 'src/app/shared/models/question.model';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-create-multiple-choice-exam-question-dialog',
  templateUrl: './create-multiple-choice-exam-question-dialog.component.html',
  styleUrls: ['./create-multiple-choice-exam-question-dialog.component.css'],
})
export class CreateMultipleChoiceExamQuestionDialogComponent implements OnInit {
  letters: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); // used for labelling options in multiple choice questions;

  questionForm: FormGroup<{
    randomQuestionOrder: FormControl<boolean | null>; // for multiple choice question, the questions will be in random order
  }>;
  formPopulated = new Subject<boolean>();
  formChanged = false;
  temporarycurrentQuestionDisplay = JSON.parse(
    JSON.stringify(this.data.currentQuestionDisplay)
  ) as CreateExamQuestionDto; // used to hold the value of currentQuestionDisplay without modifying the original

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      currentQuestionDisplay: CreateExamQuestionDto;
    },
    private readonly dialogRef: MatDialogRef<CreateMultipleChoiceExamQuestionDialogComponent>,
    public dialog: MatDialog,
    private readonly snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.populateQuestionForm();
  }

  populateQuestionForm(): void {
    this.questionForm = new FormGroup({
      randomQuestionOrder: new FormControl(
        this.data.currentQuestionDisplay.randomQuestionOrder ?? false,
        {
          nonNullable: false,
        }
      ),
    });
    this.formPopulated.next(true);
  }

  changeMultiChoice(index: number, checked: boolean): void {
    if (this.temporarycurrentQuestionDisplay.multipleChoiceQuestionList) {
      if (
        this.temporarycurrentQuestionDisplay.type?.toLowerCase() ===
        'multiple-choice-single'
      ) {
        for (const question of this.temporarycurrentQuestionDisplay
          .multipleChoiceQuestionList) {
          question.correct = false;
        }
      }

      this.temporarycurrentQuestionDisplay.multipleChoiceQuestionList[
        index
      ].correct = checked;
    }
  }

  changeMultiChoiceText(index: number, text: string): void {
    if (this.temporarycurrentQuestionDisplay.multipleChoiceQuestionList) {
      this.temporarycurrentQuestionDisplay.multipleChoiceQuestionList[
        index
      ].text = text;
    }
    this.formChanged = true;
  }

  addMultipleChoiceOption(): void {
    if (
      !this.temporarycurrentQuestionDisplay.multipleChoiceQuestionList ||
      this.temporarycurrentQuestionDisplay.multipleChoiceQuestionList.length <
        10
    ) {
      if (!this.temporarycurrentQuestionDisplay.multipleChoiceQuestionList) {
        this.temporarycurrentQuestionDisplay.multipleChoiceQuestionList = [
          {
            text: '',
            correct: false,
          },
        ];
      } else {
        this.temporarycurrentQuestionDisplay.multipleChoiceQuestionList.push({
          text: '',
          correct: false,
        });
      }
      this.formChanged = true;
    } else {
      this.snackbarService.queueBar(
        'warn',
        'Maximum number of question options reached. Please delete some options before adding more.'
      );
    }
  }

  removeMultiChoiceOption(optionIndex: number): void {
    this.temporarycurrentQuestionDisplay.multipleChoiceQuestionList?.splice(
      optionIndex,
      1
    );
    this.formChanged = true;
  }

  togglePartialMarking(toggle: boolean): void {
    this.temporarycurrentQuestionDisplay.partialMarking = toggle;
    this.formChanged = true;
  }

  toggleRnadomQuestionOrder(toggle: boolean): void {
    this.temporarycurrentQuestionDisplay.randomQuestionOrder = toggle;
    this.formChanged = true;
  }

  isCorrectOptionSelected(): boolean {
    return (
      this.temporarycurrentQuestionDisplay.multipleChoiceQuestionList?.some(
        (question) => question.correct
      ) ?? false
    );
  }

  closeDialog(): void {
    if (this.formChanged) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Close Multiple Choice Form?',
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
