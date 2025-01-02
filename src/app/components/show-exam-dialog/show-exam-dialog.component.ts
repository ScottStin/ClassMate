/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { QuestionService } from 'src/app/services/question-service/question.service';
// import { ExamService } from 'src/app/services/exam-service/exam.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { demoLevels } from 'src/app/shared/demo-data';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { LevelDTO, UserDTO } from 'src/app/shared/models/user.model';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import {
  QuestionList,
  StudentQuestionReponse,
} from '../create-exam-dialog/create-exam-dialog.component';

@Component({
  selector: 'app-show-exam-dialog',
  templateUrl: './show-exam-dialog.component.html',
  styleUrls: ['./show-exam-dialog.component.scss'],
})
export class ShowExamDialogComponent implements OnInit {
  error: Error;
  questionList: QuestionList[] = [];
  currentQuestionDisplay: QuestionList | null = null;
  currentQuestionIndex = 0;
  currentSubQuestionIndex = 0;
  examStarted = false;
  markingCategories = [
    { displayName: 'Vocabulary and Spelling', value: 'vocabMark' },
    { displayName: 'Grammar and Punctuation', value: 'grammarMark' },
    { displayName: 'Content', value: 'contentMark' },
  ];
  demoLevels = demoLevels;

  feedbackForm: FormGroup<{
    teacherFeedback: FormControl<string>;
    vocabMark: FormControl<number>;
    grammarMark: FormControl<number>;
    contentMark: FormControl<number>;
  }>;
  feedbackFormPopulated = new Subject<boolean>();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      exam: ExamDTO | undefined;
      questions?: QuestionList[];
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
    this.questionList = this.data.questions ?? [];
    if (this.data.displayMode || this.data.markMode) {
      this.startExam();
    }

    this.populateFeedbackForm();
  }

  startExam(): void {
    this.examStarted = true;
    this.currentQuestionDisplay = this.questionList[this.currentQuestionIndex];
  }

  /*
   * Navigate, start and end questions/sections:
   */
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

    // update the feedback form:
    if (this.data.markMode) {
      this.updateForm();
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

    // update the feedback form:
    if (this.data.markMode) {
      this.updateForm();
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

    // update the feedback form:
    if (this.data.markMode) {
      this.updateForm();
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

  /*
   * Get the index of the current sub question being displayed:
   */
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

  /*
   * Get the index of the current question being displayed:
   */
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

  /*
   * Get the index of the parent (section) of the current sub question:
   */
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

  /*
   * Populate the teacher feebcack form on init:
   */
  populateFeedbackForm(): void {
    const studentResponse = this.currentQuestionDisplay?.studentResponse?.find(
      (obj) => obj.student === this.data.student
    );
    this.feedbackForm = new FormGroup({
      teacherFeedback: new FormControl(
        {
          value: studentResponse?.feedback?.text ?? '',
          disabled: this.data.currentUser?.userType.toLowerCase() === 'student',
        },
        { validators: [Validators.required], nonNullable: true }
      ),
      vocabMark: new FormControl(
        {
          value: Number(studentResponse?.mark?.vocabMark ?? ''),
          disabled: this.data.currentUser?.userType.toLowerCase() === 'student',
        },
        { validators: [Validators.required], nonNullable: true }
      ),
      grammarMark: new FormControl(
        {
          value: Number(studentResponse?.mark?.grammarMark ?? ''),
          disabled: this.data.currentUser?.userType.toLowerCase() === 'student',
        },
        { validators: [Validators.required], nonNullable: true }
      ),
      contentMark: new FormControl(
        {
          value: Number(studentResponse?.mark?.contentMark ?? ''),
          disabled: this.data.currentUser?.userType.toLowerCase() === 'student',
        },
        { validators: [Validators.required], nonNullable: true }
      ),
    });
    this.feedbackFormPopulated.next(true);
  }

  /*
   * Changes to the student's response are emitted from the app-question component and updated here:
   */
  updateStudentResponse(text: string): void {
    // todo = simplfy function by using findCurrentStudentReponse;
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

  /*
   * When the teacher enters text into the feedback form, save the result locally and update the current question
   */
  feedbackTextChange(text: string): void {
    const studentResponse = this.findCurrentStudentReponse() ?? {};
    studentResponse.feedback = {
      text,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      teacher: this.data.currentUser!.email,
    };
  }

  /*
   * When the teacher selects a mark for the student's question in the marking table, save the result locally and update the current question
   */
  onMarkSelect(level: LevelDTO, category: string): void {
    const studentResponse = this.findCurrentStudentReponse() ?? {};
    studentResponse.mark = studentResponse.mark ?? {};
    studentResponse.mark[category] = level;

    const marksArray = [
      studentResponse.mark.vocabMark ?? 0,
      studentResponse.mark.grammarMark ?? 0,
      studentResponse.mark.contentMark ?? 0,
    ].map(Number);

    const totalUnscaledMark =
      marksArray.reduce((sum, num) => sum + num, 0) / marksArray.length;

    studentResponse.mark.totalMark = this.convertScore(
      totalUnscaledMark,
      0,
      4,
      this.currentQuestionDisplay?.totalPointsMin ?? 0,
      this.currentQuestionDisplay?.totalPointsMax ?? 5
    );

    // update the original value of the student's mark in data.exam:
    const totalScaledMark = this.getScaledTotalExamScore();
    const studentScore = this.data.exam?.studentsCompleted.find(
      (studentCompleted) => studentCompleted.email === this.data.student
    );
    if (studentScore) {
      studentScore.mark = totalScaledMark;
    }
  }

  /*
   * Feedback in the feedback table is based on a level score (e.g. 0 = a1, 1 = a2, 2 = b1, 3 = b2, 4 = c1)
   * This needs to be converted to the scale for the current question (totalPointsMin and totalPointsMax)
   */
  convertScore(
    unscaledScore: number,
    originalMin: number,
    originalMax: number,
    scaledMin: number,
    scaledMax: number
  ): number {
    const scaledMark =
      ((unscaledScore - originalMin) / (originalMax - originalMin)) *
        (scaledMax - scaledMin) +
      scaledMin;

    return Math.round(scaledMark * 10) / 10;
  }

  /*
   * When the teacher finishes their review and clicks 'submit feedback':
   */
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
    if (missingFeedback.length > 0) {
      const message = `You have not given feedback/marks for the following question(s): <br> <br> 
      <b>${missingFeedback.join(
        ',<br>'
      )}. </b> <br> <br> Are you sure you want to submit the exam? The student will receive a score of zero for the question you have not marked.`;

      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Wait! You have not answered all the questions.',
          message,
          okLabel: 'Submit',
          cancelLabel: `Return`,
          routerLink: '',
        },
      });
      confirmDialogRef.afterClosed().subscribe((result) => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access
        if (result === true) {
          this.questionService
            .submitTeacherFeedback(
              this.questionList,
              this.data.currentUser?.email,
              this.data.exam?._id,
              this.data.student,
              this.getScaledTotalExamScore().toString()
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
          this.getScaledTotalExamScore().toString()
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

  /*
   * When the student finishes their exam and clicks 'complete exam':
   */
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

  /*
   * When the current question being displayed to the user changes, update the teacher feedback form:
   */
  updateForm(): void {
    const studentResponse = this.findCurrentStudentReponse();
    if (this.currentQuestionDisplay) {
      const feedbackForm = this.feedbackForm.controls;

      feedbackForm.teacherFeedback.setValue(
        studentResponse?.feedback?.text ?? ''
      );
      feedbackForm.vocabMark.setValue(
        Number(studentResponse?.mark?.vocabMark ?? '')
      );
      feedbackForm.grammarMark.setValue(
        Number(studentResponse?.mark?.grammarMark ?? '')
      );
      feedbackForm.contentMark.setValue(
        Number(studentResponse?.mark?.contentMark ?? '')
      );
    }
  }

  /*
   * Get the student's response to the question
   */
  findCurrentStudentReponse(): StudentQuestionReponse | undefined {
    let studentResponse;
    if (this.currentQuestionDisplay?.studentResponse) {
      studentResponse = this.currentQuestionDisplay.studentResponse.find(
        (obj) => obj.student === this.data.student
      );
    }
    return studentResponse;
  }

  /*
   * Get the student's mark for the question
   */
  getStudentMark(question: QuestionList): string | number | null | undefined {
    if (question.type?.toLocaleUpperCase() !== 'section') {
      const studentResponse = question.studentResponse?.find(
        (obj) => obj.student === this.data.student
      );
      return studentResponse?.mark?.totalMark;
    } else {
      const subQuestion = this.questionList.find(
        (obj) => obj['_id'] === question['_id']
      );
      const studentResponse = subQuestion?.studentResponse?.find(
        (obj) => obj.student === this.data.student
      );
      return studentResponse?.mark?.totalMark;
    }
  }

  /*
   * Get the student's mark for the exam
   */
  getScaledTotalExamScore(): number {
    // get a list of all student responses for current exam:
    const studentResponses = this.questionList.flatMap(
      (question) => question.studentResponse
    );

    // filter the list for the current student whose exam is being marked/displayed
    const currentStudentResponses = studentResponses.filter(
      (response) => response?.student === this.data.student
    );

    // get the sum of all the points the student has scored accross all the questions:
    const totalMarkUnscaled = currentStudentResponses
      // .filter((response) => response?.mark?.totalMark)
      .map((response) => Number(response?.mark?.totalMark))
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // get the min possible points the student can score for all the questions combined:
    const unscaledMin = this.questionList
      .flatMap((question) => question.totalPointsMin)
      .filter((point): point is number => point !== null && point !== undefined)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // get the maximum possible points the student can score for all the questions combined:
    const unscaledMax = this.questionList
      .flatMap((question) => question.totalPointsMax)
      .filter((point): point is number => point !== null && point !== undefined)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const totalScaledMark = this.convertScore(
      totalMarkUnscaled,
      unscaledMin,
      unscaledMax,
      this.data.exam?.totalPointsMin ?? 0,
      this.data.exam?.totalPointsMax ?? 100
    );
    return totalScaledMark;
  }

  /*
   * Find the current exam question from the questionList
   * todo - move to seperate reusable service or helper.
   */
  findCurrentQuestionFromList(): QuestionList | undefined {
    let foundQuestion;

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (this.currentQuestionDisplay?.parent) {
      foundQuestion = this.questionList
        .find((obj) => obj.id === this.currentQuestionDisplay?.parent)
        ?.subQuestions?.find(
          (obj) => obj.id === this.currentQuestionDisplay?.id
        );
    } else {
      foundQuestion = this.questionList.find(
        (obj) => obj.id === this.currentQuestionDisplay?.id
      );
    }
    return foundQuestion;
  }

  closeDialog(result: boolean | null): void {
    this.dialogRef.close(result);
  }
}
