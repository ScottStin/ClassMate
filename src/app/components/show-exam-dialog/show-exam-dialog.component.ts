import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  error: Error;
  questionList: QuestionList[] = [];
  currentQuestionDisplay: QuestionList | null = null;
  currentQuestionIndex = 0;
  currentSubQuestionIndex = 0;
  examStarted = false;

  // examScoreForm: FormGroup = new FormGroup({
  //   examScore: new FormControl<string>('', [Validators.required]),
  //   totalExamScore: new FormControl<string>('', [Validators.required])
  // });

  examScoreForm: FormGroup = this.formBuilder.group({
    examScore: ['', Validators.required],
    totalExamScore: ['', Validators.required],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      exam: ExamDTO | undefined;
      questions: QuestionList[];
      displayMode: boolean;
      markMode: boolean;
      student: string;
      currentUser: UserDTO | null;
    },
    private readonly dialogRef: MatDialogRef<ShowExamDialogComponent>,
    private readonly questionService: QuestionService,
    private readonly snackbarService: SnackbarService,
    public dialog: MatDialog,
    private readonly formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.questionList = this.data.questions;
    if (this.data.displayMode || this.data.markMode) {
      this.startExam();
    }
    const score = this.data.exam?.studentsCompleted.find(
      (obj) => obj.email === this.data.student
    )?.mark;
    this.examScoreForm.patchValue({
      examScore: score ?? '',
      totalExamScore: '',
    });
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

  parentQuestionIndex(): string {
    const index = this.questionList.findIndex(
      (obj) => obj['_id'] === this.currentQuestionDisplay?.parent
    );
    if (index === this.questionList.length - 1) {
      return 'last';
    } else {
      return '';
    }
  }

  submitFeedback(): void {
    const missingFeedback: string[] = [];
    for (const question of this.questionList) {
      const studentResponse = question.studentResponse?.find(
        (obj) => obj.student === this.data.student
      );
      if (
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        (!studentResponse?.mark || !studentResponse.feedback) &&
        question.teacherFeedback === true
      ) {
        [missingFeedback.push(question.name)];
      }
      if (
        question.type === 'section' &&
        question.subQuestions !== null &&
        question.subQuestions !== undefined &&
        question.subQuestions.length > 0
      ) {
        for (const subQuestion of question.subQuestions) {
          const studentResponseSubQuestion = subQuestion.studentResponse?.find(
            (obj) => obj.student === this.data.currentUser?.email
          );
          if (
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            (!studentResponseSubQuestion?.mark ||
              !studentResponseSubQuestion.feedback) &&
            question.teacherFeedback === true
          ) {
            missingFeedback.push(`${question.name}, ${subQuestion.name}`);
          }
        }
      }
    }
    if (
      missingFeedback.length > 0 ||
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access
      !this.examScoreForm.getRawValue().examScore
    ) {
      let title = 'Wait! You have not answered all the questions.';
      let message = `You have not given feedback/marks for the following question(s): <br> <br> 
      <b>${missingFeedback.join(
        ',<br>'
      )}. </b> <br> <br> Are you sure you want to submit the exam? The student will receive a score of zero for the question you have not marked.`;
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access
      if (!this.examScoreForm.getRawValue().examScore) {
        title = 'Wait! You have not given a score.';
        message = 'You must give a score for this exam before proceeding.';
      }
      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title,
          message,
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access
          okLabel: this.examScoreForm.getRawValue().examScore ? `Submit` : null,
          cancelLabel: `Return`,
          routerLink: '',
        },
      });
      confirmDialogRef.afterClosed().subscribe((result) => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access
        if (result === true && this.examScoreForm.getRawValue().examScore) {
          this.questionService
            .submitTeacherFeedback(
              this.questionList,
              this.data.currentUser?.email,
              this.data.exam?._id,
              this.data.student,
              this.examScoreForm.get('examScore')?.value as string
            )
            .subscribe({
              next: () => {
                this.snackbarService.open(
                  'info',
                  'Your feedback has been submitted. Thank you.'
                );
                this.closeDialog(true);
              },
              error: (error: Error) => {
                this.error = error;
                this.snackbarService.openPermanent('error', error.message);
              },
            });
        }
      });
    } else {
      this.questionService
        .submitTeacherFeedback(
          this.questionList,
          this.data.currentUser?.email,
          this.data.exam?._id,
          this.data.student,
          this.examScoreForm.get('examScore')?.value as string
        )
        .subscribe({
          next: () => {
            this.snackbarService.open(
              'info',
              'Your feedback has been submitted. Thank you.'
            );
            this.closeDialog(true);
          },
          error: (error: Error) => {
            this.error = error;
            this.snackbarService.openPermanent('error', error.message);
          },
        });
    }
  }

  completeExam(): void {
    const missingAnswers: string[] = [];
    for (const question of this.questionList) {
      const studentResponse = question.studentResponse?.find(
        (obj) => obj.student === this.data.currentUser?.email
      );
      if (
        (studentResponse?.response === undefined ||
          studentResponse.response === null) &&
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
          const studentResponseSubQuestion = subQuestion.studentResponse?.find(
            (obj) => obj.student === this.data.currentUser?.email
          );
          if (
            studentResponseSubQuestion?.response === undefined ||
            studentResponseSubQuestion.response === null
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
          this.questionService
            .submitStudentResponse(
              this.questionList,
              this.data.currentUser?.email,
              this.data.exam?._id
            )
            .subscribe({
              next: () => {
                this.snackbarService.open('info', 'Exam completed! Well done.');
                this.closeDialog(true);
              },
              error: (error: Error) => {
                this.error = error;
                this.snackbarService.openPermanent('error', error.message);
              },
            });
        }
      });
    } else {
      this.questionService
        .submitStudentResponse(
          this.questionList,
          this.data.currentUser?.email,
          this.data.exam?._id
        )
        .subscribe({
          next: () => {
            this.snackbarService.open('info', 'Exam completed! Well done.');
            this.closeDialog(true);
          },
          error: (error: Error) => {
            this.error = error;
            this.snackbarService.openPermanent('error', error.message);
          },
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
        if (!currentQuestion.studentResponse) {
          currentQuestion.studentResponse = [];
        }
        const studentResponse = currentQuestion.studentResponse.find(
          (obj) => obj.student === this.data.currentUser?.email
        );
        if (!studentResponse) {
          currentQuestion.studentResponse.push({
            response: text,
            student: this.data.currentUser?.email,
          });
        } else {
          studentResponse.response = text;
        }
      }
    } else {
      const currentQuestion = this.questionList.find(
        (obj) => obj === this.currentQuestionDisplay
      );
      if (currentQuestion) {
        if (!currentQuestion.studentResponse) {
          currentQuestion.studentResponse = [];
        }
        const studentResponse = currentQuestion.studentResponse.find(
          (obj) => obj.student === this.data.currentUser?.email
        );
        if (!studentResponse) {
          currentQuestion.studentResponse.push({
            response: text,
            student: this.data.currentUser?.email,
          });
        } else {
          studentResponse.response = text;
        }
      }
    }
  }

  feedback(data: { feedback: string; mark: string; student: string }): void {
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
        if (!currentQuestion.studentResponse) {
          currentQuestion.studentResponse = [];
        }
        const studentResponse = currentQuestion.studentResponse.find(
          (obj) => obj.student === data.student
        );
        if (!studentResponse) {
          currentQuestion.studentResponse.push({
            student: data.student,
            feedback: {
              text: data.feedback,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              teacher: this.data.currentUser!.email,
            },
            mark: data.mark,
          });
          this.snackbarService.openPermanent('info', 'feedback and mark saved');
        } else {
          // if (this.currentUser?.user.email) {
          studentResponse.feedback = {
            text: data.feedback,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            teacher: this.data.currentUser!.email,
          };
          studentResponse.mark = data.mark;
          this.snackbarService.openPermanent('info', 'feedback and mark saved');
          // }
        }
      }
    } else {
      const currentQuestion = this.questionList.find(
        (obj) => obj === this.currentQuestionDisplay
      );
      if (currentQuestion) {
        if (!currentQuestion.studentResponse) {
          currentQuestion.studentResponse = [];
        }
        const studentResponse = currentQuestion.studentResponse.find(
          (obj) => obj.student === data.student
        );
        if (!studentResponse) {
          currentQuestion.studentResponse.push({
            student: data.student,
            feedback: {
              text: data.feedback,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              teacher: this.data.currentUser!.email,
            },
            mark: data.mark,
          });
          this.snackbarService.openPermanent('info', 'feedback and mark saved');
        } else {
          // if (this.currentUser?.user.email) {
          studentResponse.feedback = {
            text: data.feedback,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            teacher: this.data.currentUser!.email,
          };
          studentResponse.mark = data.mark;
          this.snackbarService.openPermanent('info', 'feedback and mark saved');
          // }
        }
      }
    }
  }

  getStudentMark(question: QuestionList): string | number | null | undefined {
    if (question.type?.toLocaleUpperCase() !== 'section') {
      const studentResponse = question.studentResponse?.find(
        (obj) => obj.student === this.data.student
      );
      return studentResponse?.mark;
    } else {
      const subQuestion = this.questionList.find(
        (obj) => obj['_id'] === question['_id']
      );
      const studentResponse = subQuestion?.studentResponse?.find(
        (obj) => obj.student === this.data.student
      );
      return studentResponse?.mark;
    }
  }

  closeDialog(result: boolean | null): void {
    this.dialogRef.close(result);
  }
}
