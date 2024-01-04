import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { QuestionService } from 'src/app/services/question-service/question.service';
// import { ExamService } from 'src/app/services/exam-service/exam.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { QuestionList } from '../create-exam-dialog/create-exam-dialog.component';

@Component({
  selector: 'app-show-exam-dialog',
  templateUrl: './show-exam-dialog.component.html',
  styleUrls: ['./show-exam-dialog.component.css'],
})
export class ShowExamDialogComponent implements OnInit {
  questionList: QuestionList[] = [];
  currentQuestionDisplay: QuestionList | null = null;
  currentQuestionIndex = 0;
  currentSubQuestionIndex = 0;
  examStarted = false;

  currentUser = JSON.parse(localStorage.getItem('auth_data_token')!) as
    | { user: UserDTO }
    | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      exam: ExamDTO | undefined;
      questions: QuestionList[];
    },
    private readonly dialogRef: MatDialogRef<ShowExamDialogComponent>,
    // private readonly examService: ExamService,
    private readonly questionService: QuestionService,
    private readonly snackbarService: SnackbarService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log(this.data);
    this.questionList = this.data.questions;
  }

  startExam(): void {
    this.examStarted = true;
    this.currentQuestionDisplay = this.questionList[this.currentQuestionIndex];
  }

  selectQuestion(question: QuestionList): void {
    this.currentQuestionDisplay = question;
    let index = NaN;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (question.parent) {
      const parent = this.questionList.find(
        (obj) => obj['_id'] === question.parent
      );
      if (parent?.subQuestions) {
        index = parent.subQuestions.findIndex(
          (obj) => obj === this.currentQuestionDisplay
        );
        this.currentSubQuestionIndex = index;
      }
      const parentIndex = this.questionList.findIndex((obj) => obj === parent);
      this.currentQuestionIndex = parentIndex;
    } else {
      index = this.questionList.findIndex(
        (obj) => obj === this.currentQuestionDisplay
      );
      this.currentQuestionIndex = index;
    }
  }

  nextQuestion(): void {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!this.currentQuestionDisplay?.parent) {
      this.currentQuestionIndex = this.currentQuestionIndex + 1;
      this.currentQuestionDisplay =
        this.questionList[this.currentQuestionIndex];
    } else {
      // if (this.currentQuestionDisplay.subQuestions) {
      this.currentSubQuestionIndex = this.currentSubQuestionIndex + 1;
      const parent = this.questionList.find(
        (obj) => obj['_id'] === this.currentQuestionDisplay?.parent
      );
      if (parent?.subQuestions) {
        this.currentQuestionDisplay =
          parent.subQuestions[this.currentSubQuestionIndex];
      }
    }
  }

  previousQuestion(): void {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!this.currentQuestionDisplay?.parent) {
      this.currentQuestionIndex = this.currentQuestionIndex - 1;
      this.currentQuestionDisplay =
        this.questionList[this.currentQuestionIndex];
    } else if (this.currentQuestionDisplay.subQuestions) {
      this.currentSubQuestionIndex = this.currentSubQuestionIndex - 1;
      console.log(this.currentQuestionDisplay.parent);
      const parent = this.questionList.find(
        (obj) => obj['_id'] === this.currentQuestionDisplay?.parent
      );
      if (parent?.subQuestions) {
        this.currentQuestionDisplay =
          parent.subQuestions[this.currentSubQuestionIndex];
      }
    }
  }

  startSection(): void {
    this.currentSubQuestionIndex = 0;
    if (this.currentQuestionDisplay?.subQuestions) {
      this.currentQuestionDisplay =
        this.currentQuestionDisplay.subQuestions[this.currentSubQuestionIndex];
    }
  }

  completeSection(): void {
    this.currentQuestionIndex = this.currentQuestionIndex + 1;
    this.currentQuestionDisplay = this.questionList[this.currentQuestionIndex];
  }

  subQuestionIndex(): string {
    const parent = this.questionList.find(
      (obj) => obj['_id'] === this.currentQuestionDisplay?.parent
    );
    let index = NaN;
    if (parent?.subQuestions) {
      index = parent.subQuestions.findIndex(
        (obj) => obj === this.currentQuestionDisplay
      );
      if (index === 0) {
        return 'first';
      }
      if (index === parent.subQuestions.length - 1) {
        return 'last';
      }
    }
    return '';
  }

  questionIndex(): string {
    const index = this.questionList.findIndex(
      (obj) => obj === this.currentQuestionDisplay
    );
    if (index === this.questionList.length - 1) {
      return 'last';
    } else {
      return '';
    }
  }

  completeExam(): void {
    const missingAnswers: string[] = [];
    for (const question of this.questionList) {
      // const studentResponse = question.studentResponse?.find(
      //   (obj) => obj.student === this.currentUser?.user.email
      // );
      if (
        (question.studentResponse?.response === undefined ||
          question.studentResponse.response === null) &&
        question.type?.toLocaleLowerCase() !== 'section'
      ) {
        [missingAnswers.push(question.name)];
      }
      if (
        question.type === 'section' &&
        question.subQuestions !== null &&
        question.subQuestions !== undefined &&
        question.subQuestions.length > 0
      ) {
        for (const subQuestion of question.subQuestions) {
          if (
            subQuestion.studentResponse?.response === undefined ||
            subQuestion.studentResponse.response === null
          ) {
            missingAnswers.push(`${question.name}, ${subQuestion.name}`);
          }
        }
      }
    }
    if (missingAnswers.length > 0) {
      let message = 'The following questions have no been answered';
      if (missingAnswers.length === 1) {
        message = 'The following question has no been answered';
      }
      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Wait! You have not answered all the questions.',
          message: `${message}: <br> <br> 
            <b>${missingAnswers.join(
              ',<br>'
            )}. </b> <br> <br> If you submit your exam without answering a question, you will be given a marking of 0 for that question.`,
          okLabel: `Submit`,
          cancelLabel: `Return`,
          routerLink: '',
        },
      });
      confirmDialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          console.log(result);
          this.questionService.submitStudentResponse(
            this.questionList,
            this.currentUser?.user.email,
            this.data.exam?._id
          );
        }
      });
    }
  }

  response(text: string): void {
    if (
      this.currentQuestionDisplay?.parent !== null &&
      this.currentQuestionDisplay !== null
    ) {
      const currentQuestion = this.questionList
        .find((obj) => obj['_id'] === this.currentQuestionDisplay?.parent)
        ?.subQuestions?.find(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (obj) => obj['_id'] === this.currentQuestionDisplay!['_id']
        );
      if (currentQuestion) {
        currentQuestion.studentResponse = {
          response: text,
          // student: this.currentUser?.user.email,
        };
      }
    } else {
      const currentQuestion = this.questionList.find(
        (obj) => obj === this.currentQuestionDisplay
      );
      if (currentQuestion) {
        currentQuestion.studentResponse = {
          response: text,
          // student: this.currentUser?.user.email,
        };
      }
    }
  }

  closeDialog(result: boolean | null): void {
    this.dialogRef.close(result);
  }
}
