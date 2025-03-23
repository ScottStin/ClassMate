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
  selector: 'app-create-match-options-exam-question-dialog',
  templateUrl: './create-match-options-exam-question-dialog.component.html',
  styleUrls: ['./create-match-options-exam-question-dialog.component.css'],
})
export class CreateMatchOptionsExamQuestionDialogComponent implements OnInit {
  letters: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); // used for labelling options in match choice questions;

  questionForm: FormGroup<{
    randomQuestionOrder: FormControl<boolean | null>; // for match option choice question, the questions will be in random order
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
    private readonly dialogRef: MatDialogRef<CreateMatchOptionsExamQuestionDialogComponent>,
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

  changeMatchOptionText(
    index: number,
    text: string,
    side: 'leftOption' | 'rightOption'
  ): void {
    if (this.temporarycurrentQuestionDisplay.matchOptionQuestionList) {
      this.temporarycurrentQuestionDisplay.matchOptionQuestionList[index][
        side
      ] = text;
    }
    this.formChanged = true;
  }

  addMatchOption(): void {
    if (
      !this.temporarycurrentQuestionDisplay.matchOptionQuestionList ||
      this.temporarycurrentQuestionDisplay.matchOptionQuestionList.length < 10
    ) {
      if (!this.temporarycurrentQuestionDisplay.matchOptionQuestionList) {
        this.temporarycurrentQuestionDisplay.matchOptionQuestionList = [
          {
            leftOption: '',
            rightOption: '',
          },
        ];
      } else {
        this.temporarycurrentQuestionDisplay.matchOptionQuestionList.push({
          leftOption: '',
          rightOption: '',
        });
      }
      this.formChanged = true;
    } else {
      this.snackbarService.open(
        'warn',
        'Maximum number of question options reached. Please delete some options before adding more'
      );
    }
  }

  removeMatchOption(optionIndex: number): void {
    this.temporarycurrentQuestionDisplay.matchOptionQuestionList?.splice(
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

  closeDialog(): void {
    if (this.formChanged) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Close Match Option Form?',
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
