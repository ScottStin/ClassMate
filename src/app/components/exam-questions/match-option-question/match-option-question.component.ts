/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
  selector: 'app-match-option-question',
  templateUrl: './match-option-question.component.html',
  styleUrls: ['./match-option-question.component.css'],
})
export class MatchOptionQuestionComponent implements OnInit, OnChanges {
  @Input() question: CreateExamQuestionDto | null;
  @Input() disableForms: boolean;
  @Input() markMode: boolean;
  @Input() displayMode: boolean;
  @Input() currentUserId: string | undefined;
  @Output() responseChange = new EventEmitter<string>();

  leftQuestionOptions: { option: string; id: string }[] = [];
  rightQuestionOptions: { option: string; id: string }[] = [];
  studentResponse?: string;
  disableDragForm = false;

  ngOnInit(): void {
    this.getQuestionOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('question' in changes && this.question) {
      this.getQuestionOptions();
    }
  }

  getQuestionOptions(): void {
    this.leftQuestionOptions =
      this.question?.matchOptionQuestionList?.map((option) => ({
        option: option.leftOption,
        id: option._id ?? '',
      })) ?? [];

    this.rightQuestionOptions =
      this.question?.matchOptionQuestionList?.map((option) => ({
        option: option.rightOption,
        id: option._id ?? '',
      })) ?? [];

    this.studentResponse =
      this.question?.studentResponse?.find(
        (response) => response.studentId === this.currentUserId
      )?.response ?? undefined;

    // Shuffle left if student hasn't completed question:
    if (this.question?.randomQuestionOrder && !this.studentResponse) {
      for (let i = this.leftQuestionOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = this.leftQuestionOptions[i];
        this.leftQuestionOptions[i] = this.leftQuestionOptions[j];
        this.leftQuestionOptions[j] = temp;
      }
    }

    // Shuffle right side column:
    if (!this.studentResponse) {
      for (let i = this.rightQuestionOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = this.rightQuestionOptions[i];
        this.rightQuestionOptions[i] = this.rightQuestionOptions[j];
        this.rightQuestionOptions[j] = temp;
      }
    } else {
      // if student has responded to the question, get their response and match it to the left side column:
      const studentResponse = JSON.parse(this.studentResponse) as {
        leftOption: { id: string; option: string };
        rightOption: { id: string; option: string };
      }[];

      const reorderedRightOptions = this.leftQuestionOptions.map((leftItem) => {
        const matchingResponse = studentResponse.find(
          (response) => response.leftOption.id === leftItem.id
        )?.rightOption;
        return {
          id: matchingResponse?.id ?? '',
          option: matchingResponse?.option ?? '',
        };
      });
      this.rightQuestionOptions = reorderedRightOptions;
    }

    if (this.markMode || this.displayMode) {
      this.disableDragForm = true;
    } else {
      this.disableDragForm = false;
      this.saveStudentResponse(); // save the student response by default (in case they are happy with the current order and want to continue wihtout changing the order)
    }
  }

  drop(event: CdkDragDrop<string[]>): void {
    if (this.disableDragForm) {
      return;
    }

    moveItemInArray(
      this.rightQuestionOptions,
      event.previousIndex,
      event.currentIndex
    );

    this.saveStudentResponse();
  }

  saveStudentResponse(): void {
    // convert the student's answer to a numbered string and emit the result:
    const studentResultArray = this.leftQuestionOptions.map((item, index) => ({
      leftOption: item,
      rightOption: this.rightQuestionOptions[index],
    }));

    // console.log(JSON.stringify(studentResultArray));
    this.studentResponse = JSON.stringify(studentResultArray);
    this.responseChange.emit(this.studentResponse);
  }
}
