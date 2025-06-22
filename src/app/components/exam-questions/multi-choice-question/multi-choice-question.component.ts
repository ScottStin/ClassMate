/* eslint-disable @typescript-eslint/strict-boolean-expressions */
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
  selector: 'app-multi-choice-question',
  templateUrl: './multi-choice-question.component.html',
  styleUrls: ['./multi-choice-question.component.css'],
})
export class MultiChoiceQuestionComponent implements OnInit, OnChanges {
  @Input() question: CreateExamQuestionDto | null;
  @Input() disableForms: boolean;
  @Input() markMode: boolean;
  @Input() displayMode: boolean;
  @Input() currentUserId: string | undefined;
  @Output() responseChange = new EventEmitter<string>();

  loading = true;
  isSingleResponseType = false;
  selectedOptions: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if ('question' in changes && this.question) {
      this.loadPageData();
    }
  }

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData(): void {
    if (!this.question) {
      return;
    }

    this.isSingleResponseType =
      this.question.type?.toLowerCase() === 'multiple-choice-single';

    const studentResponse = this.question.studentResponse?.find(
      (obj) => obj.studentId === this.currentUserId
    );

    if (studentResponse?.response) {
      this.selectedOptions = JSON.parse(studentResponse.response) as string[];
    }
  }

  changeMultiChoice(optionId: string, checked: boolean): void {
    if (!this.question?.type) {
      return;
    }

    if (this.isSingleResponseType) {
      if (checked) {
        this.selectedOptions = [optionId];
      } else {
        this.selectedOptions = [];
      }
    } else {
      if (checked && !this.selectedOptions.includes(optionId)) {
        this.selectedOptions.push(optionId);
      }

      if (!checked) {
        this.selectedOptions = this.selectedOptions.filter(
          (id) => id !== optionId
        );
      }
    }

    this.responseChange.emit(JSON.stringify(this.selectedOptions));
  }
}
