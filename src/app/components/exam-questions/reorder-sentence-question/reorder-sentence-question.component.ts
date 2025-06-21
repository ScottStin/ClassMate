/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CreateExamQuestionDto } from 'src/app/shared/models/question.model';

@Component({
  selector: 'app-reorder-sentence-question',
  templateUrl: './reorder-sentence-question.component.html',
  styleUrls: ['./reorder-sentence-question.component.css'],
})
export class ReorderSentenceQuestionComponent implements OnInit, OnChanges {
  @Input() question: CreateExamQuestionDto | null;
  @Input() disableForms: boolean;
  @Input() markMode: boolean;
  @Input() displayMode: boolean;
  @Input() currentUserId: string | undefined;
  @Output() responseChange = new EventEmitter<string>();

  questionOptions: string[] = [];
  correctOrder: string[] = [];
  studentResponse?: string;
  disableDragForm = false;
  delimiter = '\u241E';

  ngOnInit(): void {
    this.getQuestionOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('question' in changes && this.question) {
      this.getQuestionOptions();
    }
  }

  getQuestionOptions(): void {
    this.questionOptions =
      this.question?.reorderSentenceQuestionList?.map(
        (option) => option.text
      ) ?? [];

    this.correctOrder = this.questionOptions;

    this.studentResponse =
      this.question?.studentResponse?.find(
        (response) => response.studentId === this.currentUserId
      )?.response ?? undefined;

    // shuffle array options if student hasn't completed question:
    if (!this.studentResponse || this.studentResponse.length === 0) {
      for (let i = this.questionOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = this.questionOptions[i];
        this.questionOptions[i] = this.questionOptions[j];
        this.questionOptions[j] = temp;
      }
    } else {
      // if student has responded to the question, get their response:
      this.questionOptions = this.studentResponse.split(this.delimiter);
    }

    if (this.markMode || this.displayMode) {
      this.disableDragForm = true;
    } else {
      this.disableDragForm = false;
    }
  }

  drop(event: CdkDragDrop<string[]>): void {
    if (this.disableDragForm) {
      return;
    }

    moveItemInArray(
      this.questionOptions,
      event.previousIndex,
      event.currentIndex
    );

    // convert the student's answer to a numbered string and emit the result:
    const studentResultString = this.questionOptions.join(this.delimiter);
    this.responseChange.emit(studentResultString);
  }
}
