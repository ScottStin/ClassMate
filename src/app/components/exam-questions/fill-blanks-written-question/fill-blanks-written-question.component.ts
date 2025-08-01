import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  CreateExamQuestionDto,
  FillBlanksQuestionDto,
} from 'src/app/shared/models/question.model';

@Component({
  selector: 'app-fill-blanks-written-question',
  templateUrl: './fill-blanks-written-question.component.html',
  styleUrls: ['./fill-blanks-written-question.component.css'],
})
export class FillBlanksWrittenQuestionComponent implements OnInit, OnChanges {
  @Input() question: CreateExamQuestionDto | null;
  @Input() disableForms: boolean;
  @Input() markMode: boolean;
  @Input() displayMode: boolean;
  @Input() currentUserId: string | undefined;
  @Input() currentUserType?: string;
  @Output() responseChange = new EventEmitter<string>();

  blanksQuestionListWithHighlights: FillBlanksQuestionDto[] = [];
  studentResponses: string[][] = [['']];
  isSelect: boolean;

  ngOnInit(): void {
    if (this.question?.fillBlanksQuestionList) {
      this.resetBlankQuestionList();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('question' in changes && this.question?.fillBlanksQuestionList) {
      this.resetBlankQuestionList();
    }
  }

  onInput(input: string, optionIndex: number, questionIndex: number): void {
    if (!this.studentResponses[questionIndex]) {
      this.studentResponses[questionIndex] = [];
    }

    this.studentResponses[questionIndex][optionIndex] = input;
    this.responseChange.emit(JSON.stringify(this.studentResponses));
  }

  onInputHover(optionIndex: number, questionIndex: number): void {
    const keyword = `${optionIndex + 1}.__________`;
    const unmodifiedText =
      this.blanksQuestionListWithHighlights[questionIndex].text;

    const regex = new RegExp(`\\b(${keyword})\\b`, 'giu');
    this.blanksQuestionListWithHighlights[questionIndex].text =
      unmodifiedText.replace(regex, '<b>$1 </b>');
  }

  offInputHover(optionIndex: number, questionIndex: number): void {
    this.blanksQuestionListWithHighlights[questionIndex].text =
      this.blanksQuestionListWithHighlights[questionIndex].text
        .replace(/<b>/gu, '')
        .replace(/<\/b>/gu, '');
  }

  onInputClick(optionIndex: number, questionIndex: number): void {
    for (const option of this.blanksQuestionListWithHighlights) {
      option.text = option.text
        .replace(/<mark>/gu, '')
        .replace(/<\/mark>/gu, '');
    }

    const keyword = `${optionIndex + 1}.__________`;
    const unmodifiedText =
      this.blanksQuestionListWithHighlights[questionIndex].text;

    const regex = new RegExp(`\\b(${keyword})\\b`, 'giu');

    this.blanksQuestionListWithHighlights[questionIndex].text =
      unmodifiedText.replace(regex, '<mark>$1 </mark>');
  }

  resetBlankQuestionList(): void {
    this.blanksQuestionListWithHighlights = JSON.parse(
      JSON.stringify(this.question?.fillBlanksQuestionList ?? [])
    ) as FillBlanksQuestionDto[];

    this.studentResponses = this.blanksQuestionListWithHighlights.map(
      (option) => option.blanks.map(() => '')
    );

    const studentResponse = this.question?.studentResponse?.find(
      (obj) => obj.studentId === this.currentUserId
    );

    if (studentResponse?.response) {
      this.studentResponses = JSON.parse(
        studentResponse.response
      ) as string[][];
    }

    this.isSelect = this.question?.type === 'fill-in-blanks-select';
  }

  displayCorrectAnswerMark(
    correctAnswer: { text: string; correctSelectOptionIndex?: number },
    studentResponse: string
  ): boolean | undefined {
    if (
      !this.markMode &&
      this.displayMode &&
      this.currentUserType !== 'student'
    ) {
      return undefined;
    }

    if (
      !this.markMode &&
      !this.displayMode &&
      this.currentUserType === 'student'
    ) {
      return undefined;
    }

    let modifiedCorrectAnswer = correctAnswer.text
      .split('/')
      .map((answer) => answer.trim());
    let modifiedStudentResponse = studentResponse.trim();

    if (this.isSelect) {
      if (correctAnswer.correctSelectOptionIndex === undefined) {
        return undefined;
      }

      return (
        (JSON.parse(modifiedCorrectAnswer[0]) as string)[
          correctAnswer.correctSelectOptionIndex
        ].trim() === modifiedStudentResponse.trim()
      );
    }

    if (!this.question?.caseSensitive) {
      modifiedCorrectAnswer = modifiedCorrectAnswer.map((answer) =>
        answer.toLowerCase()
      );
      modifiedStudentResponse = studentResponse.toLowerCase();
    }

    if (!modifiedCorrectAnswer.includes(modifiedStudentResponse)) {
      return false;
    }

    return true;
  }

  getSelectOptions(optionIndex: number, blankIndex: number): string[] {
    return JSON.parse(
      this.blanksQuestionListWithHighlights[optionIndex].blanks.map(
        (blank) => blank.text
      )[blankIndex]
    ) as string[];
  }

  getBlankPlaceholderValue(
    studentResponse: string,
    blankIndex: number,
    optionIndex: number
  ): string {
    let string = `Blank ${blankIndex + 1}`;

    if (!this.question?.fillBlanksQuestionList) {
      return string;
    }

    const blank =
      this.question.fillBlanksQuestionList[optionIndex].blanks[blankIndex].text;

    if (this.currentUserType !== 'student' && !studentResponse) {
      string = `Correct answer(s): ${blank}`;
    }
    return string;
  }

  isMatSelectDisabled(): boolean {
    if (
      !this.markMode &&
      this.displayMode &&
      this.currentUserType !== 'student'
    ) {
      return true;
    }

    if (this.currentUserType === 'student' && this.displayMode) {
      return true;
    }

    return false;
  }

  showCorrectSelectOptionPreview(
    correctAnswer: { text: string; correctSelectOptionIndex?: number },
    option: string
  ): boolean {
    if (this.currentUserType === 'student') {
      return false;
    }

    if (
      !correctAnswer.correctSelectOptionIndex &&
      correctAnswer.correctSelectOptionIndex !== 0
    ) {
      return false;
    }

    return (
      option ===
      (JSON.parse(correctAnswer.text) as string[])[
        correctAnswer.correctSelectOptionIndex
      ]
    );
  }
}
