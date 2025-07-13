/* eslint-disable no-multi-assign */
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
import { CreateMultipleChoiceExamQuestionDialogComponent } from '../create-multiple-choice-exam-question-dialog/create-multiple-choice-exam-question-dialog.component';

@Component({
  selector: 'app-create-fill-blanks-exam-question-dialog',
  templateUrl: './create-fill-blanks-exam-question-dialog.component.html',
  styleUrls: ['./create-fill-blanks-exam-question-dialog.component.css'],
})
export class CreateFillBlanksExamQuestionDialogComponent implements OnInit {
  letters: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); // used for labelling options in questions;
  questions: { text: string }[] = [
    { text: '' }, // Initialize with one question
  ];
  formChanged = false;
  questionForm: FormGroup<{
    randomQuestionOrder: FormControl<boolean | null>; // for multiple choice question, the questions will be in random order
  }>;
  formPopulated = new Subject<boolean>();
  temporarycurrentQuestionDisplay = JSON.parse(
    JSON.stringify(this.data.currentQuestionDisplay ?? {})
  ) as CreateExamQuestionDto; // used to hold the value of currentQuestionDisplay without modifying the original

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      currentQuestionDisplay?: CreateExamQuestionDto;
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
        this.data.currentQuestionDisplay?.randomQuestionOrder ?? false,
        {
          nonNullable: false,
        }
      ),
    });
    this.formPopulated.next(true);
  }

  /**
   * This function adds a new blank space ( __________ ) to a question in the text area
   * It also adds a corresponding input box next to that question for the user to type the blank
   */
  addBlankToQuestion(index: number, textArea: HTMLTextAreaElement): void {
    if (
      this.temporarycurrentQuestionDisplay.fillBlanksQuestionList &&
      this.temporarycurrentQuestionDisplay.fillBlanksQuestionList[index].blanks
        .length < 8
    ) {
      const currentText =
        this.temporarycurrentQuestionDisplay.fillBlanksQuestionList[index].text;

      // Check if the total length of text (including spaces) exceeds 2000 characters
      if (currentText.length >= 2000) {
        this.snackbarService.queueBar(
          'warn',
          'The maximum text length of 2000 characters has been reached. Cannot add more blanks.'
        );
        return; // Prevent adding more blanks if the limit is exceeded
      }

      // Get the current position of the cursor
      const start = textArea.selectionStart;

      // Log the text behind the cursor
      const textBehindCursor = currentText.slice(0, start);

      // Count how many "__________" exist in the text behind the cursor
      const blankCount = (textBehindCursor.match(/__________/gu) ?? []).length;

      // Insert the new blank at the blankCount position in the blanks array
      this.temporarycurrentQuestionDisplay.fillBlanksQuestionList[
        index
      ].blanks.splice(blankCount, 0, { text: '' });

      // Add the blank to the text at the correct position (no number initially)
      const blankText = ` __________ `;
      const updatedText =
        currentText.slice(0, start) + blankText + currentText.slice(start);

      // Update the text in the question
      this.temporarycurrentQuestionDisplay.fillBlanksQuestionList[index].text =
        updatedText;

      // now renumber the blanks in the text area:
      this.updateTextAreaNumberList(index);

      // Set the cursor to immediately after the inserted blank
      setTimeout(() => {
        textArea.selectionStart = start + blankText.length;
        textArea.selectionEnd = start + blankText.length;
        textArea.focus();
      }, 0);

      this.formChanged = true;
    } else {
      this.snackbarService.queueBar(
        'warn',
        'Maximum number of blanks for this question have been reached. Please delete some blanks before adding more.'
      );
    }
  }

  /**
   * When a blank is added or deleted form the text area, this function updates the number for all blanks in the text area
   */
  updateTextAreaNumberList(questionIndex: number): void {
    if (this.temporarycurrentQuestionDisplay.fillBlanksQuestionList) {
      // Remove any existing numbering before the blanks (e.g., 1., 2., 3.)
      let textWithoutNumbers =
        this.temporarycurrentQuestionDisplay.fillBlanksQuestionList[
          questionIndex
        ].text;
      textWithoutNumbers = textWithoutNumbers.replace(/\d+\./gu, ''); // This removes numbers before blanks like '1.', '2.', etc.

      // Now, add numbers before each blank (e.g., 1.__________, 2.__________, etc.)
      let textWithNumbers = textWithoutNumbers;
      let blankIndex = 1;

      // Match all "__________" and replace them with numbered blanks
      textWithNumbers = textWithNumbers.replace(
        /__________/gu,
        () => `${blankIndex++}.__________`
      );

      // Update the question text with numbered blanks
      this.temporarycurrentQuestionDisplay.fillBlanksQuestionList[
        questionIndex
      ].text = textWithNumbers;
    }
  }

  /**
   * Updates the value of temporarycurrentQuestionDisplay when a blank text is changed
   * This happens when the user types into the input field assocaited with the blank
   */
  changeBlankText(index: number, blankIndex: number, text: string): void {
    if (this.temporarycurrentQuestionDisplay.fillBlanksQuestionList) {
      this.temporarycurrentQuestionDisplay.fillBlanksQuestionList[index].blanks[
        blankIndex
      ].text = text;
    }
    this.formChanged = true;
  }

  /**
   * Removes a blank from the textarea, and deletes the corresponding input
   */
  deleteBlank(
    questionIndex: number,
    blankIndex: number,
    textArea: HTMLTextAreaElement
  ): void {
    if (this.temporarycurrentQuestionDisplay.fillBlanksQuestionList) {
      const question =
        this.temporarycurrentQuestionDisplay.fillBlanksQuestionList[
          questionIndex
        ];

      // Remove the blank from the blanks array
      question.blanks.splice(blankIndex, 1);

      // Remove the corresponding blank from the text
      let blankCounter = 0;
      const updatedText = question.text.replace(/\d+\.\s*__________/gu, () => {
        if (blankCounter === blankIndex) {
          blankCounter++; // Skip this blank
          return ''; // Remove this blank
        }
        return `${++blankCounter}.__________`; // Renumber the remaining blanks
      });

      // Update the text
      question.text = updatedText;

      this.updateTextAreaNumberList(questionIndex);

      // Refocus the text area after updates
      setTimeout(() => {
        textArea.focus();
      }, 0);
    }
  }

  /**
   * Stops the user from clicking on a blank in the text area, so they can't delete or modidy if
   * This forces the user to use the input fields to delete/modify blanks, not the text area
   */
  preventClickOnBlanks(event: MouseEvent, index: number): void {
    if (this.temporarycurrentQuestionDisplay.fillBlanksQuestionList) {
      const textArea = event.target as HTMLTextAreaElement;
      const cursorPosition = textArea.selectionStart;
      const text =
        this.temporarycurrentQuestionDisplay.fillBlanksQuestionList[index].text;

      // Check if the cursor is on or next to a blank, or within 3 characters before a blank
      if (
        text[cursorPosition] === '_' || // Cursor is on a blank
        text[cursorPosition - 1] === '_' || // Cursor is next to a blank (left)
        (cursorPosition >= 3 &&
          text.slice(cursorPosition - 3, cursorPosition).includes('_')) // Cursor is within 3 characters before a blank
      ) {
        // Prevent the cursor from staying on the blank
        event.preventDefault();

        // Reset the cursor to the end of the text or a safe position
        textArea.selectionStart = textArea.selectionEnd = text.length; // Move cursor to end
        textArea.focus();
      }
    }
  }

  /**
   * Stops the user from using arrow keys to selects a blank in the text area, so they can't delete or modidy if
   * This forces the user to use the input fields to delete/modify blanks, not the text area
   */
  preventArrowKeysOnBlanks(event: KeyboardEvent, index: number): void {
    if (this.temporarycurrentQuestionDisplay.fillBlanksQuestionList) {
      const textArea = event.target as HTMLTextAreaElement;
      const cursorPosition = textArea.selectionStart;
      const text =
        this.temporarycurrentQuestionDisplay.fillBlanksQuestionList[index].text;

      if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        const newPosition =
          event.key === 'ArrowLeft' ? cursorPosition - 1 : cursorPosition + 1;

        // Check if the cursor would move to or next to a blank, or within 3 characters before a blank
        if (
          text[newPosition] === '_' || // Cursor would move to a blank
          text[newPosition - 1] === '_' || // Cursor would move next to a blank
          (newPosition >= 3 &&
            text.slice(newPosition - 3, newPosition).includes('_')) // Cursor would move within 3 characters before a blank
        ) {
          event.preventDefault(); // Block the arrow key navigation
        }
      }
    }
  }

  /**
   * Stops the user from highlighting a blank in the text area, so they can't delete or modidy if
   * This forces the user to use the input fields to delete/modify blanks, not the text area
   */
  preventHighlightingBlanks(event: Event, index: number): void {
    if (this.temporarycurrentQuestionDisplay.fillBlanksQuestionList) {
      const textArea = event.target as HTMLTextAreaElement;
      const text =
        this.temporarycurrentQuestionDisplay.fillBlanksQuestionList[index].text;

      // Get the selected text range
      const selectionStart = textArea.selectionStart;
      const selectionEnd = textArea.selectionEnd;

      // Check if any blanks are included in the selection, or if the selection is within 3 characters before a blank
      const selectedText = text.slice(selectionStart, selectionEnd);
      if (
        selectedText.includes('_') || // Selection includes a blank
        (selectionStart >= 3 &&
          text.slice(selectionStart - 3, selectionStart).includes('_')) // Selection includes 3 characters before a blank
      ) {
        event.preventDefault(); // Cancel the selection
        textArea.selectionStart = textArea.selectionEnd = text.length; // Reset cursor to the end
        textArea.focus();
      }
    }
  }

  /**
   * Stops the user from deleting a blank with the delete or backspace keys in the text area, so they can't delete or modidy if
   * This forces the user to use the input fields to delete/modify blanks, not the text area
   */
  preventDeleteOnBlanks(event: KeyboardEvent, index: number): void {
    if (this.temporarycurrentQuestionDisplay.fillBlanksQuestionList) {
      const textArea = event.target as HTMLTextAreaElement;
      const cursorPosition = textArea.selectionStart;
      const text =
        this.temporarycurrentQuestionDisplay.fillBlanksQuestionList[index].text;

      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Prevent delete if cursor is 3 characters before a blank
        if (
          cursorPosition + 3 <= text.length &&
          text.slice(cursorPosition, cursorPosition + 3).includes('_')
        ) {
          event.preventDefault(); // Block the delete key
        }
      }
    }
    this.formChanged = true;
  }

  /**
   * Adds a question (text area) to the fillBlanksQuestionList
   */
  addQuestion(): void {
    if (
      !this.temporarycurrentQuestionDisplay.fillBlanksQuestionList ||
      this.temporarycurrentQuestionDisplay.fillBlanksQuestionList.length < 10
    ) {
      if (!this.temporarycurrentQuestionDisplay.fillBlanksQuestionList) {
        this.temporarycurrentQuestionDisplay.fillBlanksQuestionList = [
          {
            text: '',
            blanks: [],
          },
        ];
      } else {
        this.temporarycurrentQuestionDisplay.fillBlanksQuestionList.push({
          text: '',
          blanks: [],
        });
      }
      this.formChanged = true;
    } else {
      this.snackbarService.queueBar(
        'warn',
        'Maximum number of questions reached. Please delete some options before adding more.'
      );
    }
  }

  /**
   * Removes a question (text area) to the fillBlanksQuestionList
   */
  removeQuestion(index: number): void {
    this.temporarycurrentQuestionDisplay.fillBlanksQuestionList?.splice(
      index,
      1
    );
    this.formChanged = true;
  }

  /**
   * Toggles:
   */
  togglePartialMarking(toggle: boolean): void {
    this.temporarycurrentQuestionDisplay.partialMarking = toggle;
    this.formChanged = true;
  }

  toggleRandomQuestionOrder(toggle: boolean): void {
    this.temporarycurrentQuestionDisplay.randomQuestionOrder = toggle;
    this.formChanged = true;
  }

  toggleCaseSensitive(toggle: boolean): void {
    this.temporarycurrentQuestionDisplay.caseSensitive = toggle;
    this.formChanged = true;
  }

  /**
   * Close dialog actions:
   */
  closeDialog(): void {
    if (this.formChanged) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Close Fill-in-the-Blanks Question Form?',
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
