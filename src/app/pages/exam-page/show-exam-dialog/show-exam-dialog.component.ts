/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize, forkJoin, map, Observable, of, Subject, tap } from 'rxjs';
import {
  AiExamQuestionFeedbackService,
  AudioMark,
  RepeatSentenceMark,
  WrittenMark,
} from 'src/app/services/ai-exam-question-feedback-service/ai-exam-question-feedback.service';
import { QuestionService } from 'src/app/services/question-service/question.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { demoLevels } from 'src/app/shared/demo-data';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import {
  ExamQuestionDto,
  ExamQuestionTypes,
  StudentQuestionReponse,
} from 'src/app/shared/models/question.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-show-exam-dialog',
  templateUrl: './show-exam-dialog.component.html',
  styleUrls: ['./show-exam-dialog.component.scss'],
})
export class ShowExamDialogComponent implements OnInit {
  error: Error;
  questionList: ExamQuestionDto[] = [];
  currentQuestionDisplay: ExamQuestionDto | null = null;
  currentQuestionIndex = 0;
  currentSubQuestionIndex = 0;
  examStarted = false;
  demoLevels = demoLevels;
  aiMarkingLoading = false;
  submitExamLoading = false;
  maxFeedbackWordLimit = 600;

  feedbackForm: FormGroup<{
    teacherFeedback: FormControl<string>;
    vocabMark?: FormControl<number>;
    grammarMark?: FormControl<number>;
    contentMark?: FormControl<number>;
    pronunciationMark?: FormControl<number | undefined>;
    fluencyMark?: FormControl<number | undefined>;
    accuracyMark?: FormControl<number | undefined>;
  }>;
  feedbackFormPopulated = new Subject<boolean>();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      exam: ExamDTO;
      questions?: ExamQuestionDto[];
      displayMode: boolean;
      markMode: boolean;
      studentId: string;
      currentUser: UserDTO | null;
    },
    private readonly dialogRef: MatDialogRef<ShowExamDialogComponent>,
    private readonly questionService: QuestionService,
    private readonly aiExamQuestionFeedbackService: AiExamQuestionFeedbackService,
    private readonly snackbarService: SnackbarService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.questionList = this.data.questions ?? [];
    if (this.data.displayMode || this.data.markMode) {
      this.startExam();
    }
    this.populateFeedbackForm();

    // --- Apply AI feedback if marking for the first time:
    if (
      this.data.markMode &&
      !(
        this.data.exam.aiMarkingComplete
          ?.map((student) => student.studentId)
          .includes(this.data.studentId) ?? false
      )
    ) {
      //
      // first, let's check if there are any AI questions in this exam:
      const aiMarkingQuestions = this.questionList.filter(
        (question) => question.autoMarking
      );

      // Now, let's loop through the AI questions and apply our AI marking:
      if (aiMarkingQuestions.length > 0) {
        this.aiMarkingLoading = true;

        const aiMarkingObservables = aiMarkingQuestions.map((question) =>
          this.markAiQuestion(question)
        );

        forkJoin(aiMarkingObservables).subscribe({
          next: () => {
            // Save Ai marking/feedback to question:
            this.questionService
              .submitTeacherFeedback(
                this.questionList,
                this.data.currentUser?._id,
                this.data.exam._id,
                this.data.studentId,
                undefined, // undefined score so the backend knows that the marking is not complete,
                true // ai marking complete
              )
              .pipe(
                finalize(() => {
                  this.aiMarkingLoading = false;
                }),
                untilDestroyed(this)
              )
              .subscribe({
                next: () => {
                  this.snackbarService.openPermanent(
                    'info',
                    "Ai marking and feedback for this student's exam has been saved. Please review the marking/feedback carefully, as the Ai is not perfect and can sometimes make mistakes."
                  );
                },
                error: (error: Error) => {
                  this.error = error;
                  this.snackbarService.openPermanent('error', error.message);
                },
              });
          },
          error: (error: Error) => {
            this.error = error;
            this.snackbarService.openPermanent('error', error.message);
          },
        });
      }
    }

    this.randomizeMultiChoiceQuestionOrder();
  }

  startExam(): void {
    this.examStarted = true;
    this.currentQuestionDisplay = this.questionList[this.currentQuestionIndex];
  }

  randomizeMultiChoiceQuestionOrder(): void {
    if (!this.data.questions) {
      return;
    }

    for (const question of this.data.questions) {
      if (question.multipleChoiceQuestionList && question.randomQuestionOrder) {
        const shuffled = question.multipleChoiceQuestionList;
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
      }
    }
  }

  markAiQuestion(question: ExamQuestionDto): Observable<void> {
    const studentResponse = question.studentResponse?.find(
      (response) => response.studentId === this.data.studentId
    )?.response;

    // --- Early return if no student response:
    if (!studentResponse) {
      return of();
    }

    // --- Get question type:
    const questionType = question.type?.toLowerCase() as
      | ExamQuestionTypes
      | undefined;

    if (
      !questionType ||
      ![
        'written-response',
        'audio-response',
        'repeat-sentence',
        'read-outloud',
        'multiple-choice-single',
        'multiple-choice-multi',
        'reorder-sentence',
      ].includes(questionType)
    ) {
      return of();
    }

    // --- Generate Ai Feedback:
    return this.aiExamQuestionFeedbackService
      .generateAiFeedbackExamQuestion({
        text: studentResponse,
        audioUrl: studentResponse,
        prompt: question.writtenPrompt ?? '',
        mediaPrompt1: {
          url: question.prompt1?.fileString ?? '',
          type: question.prompt1?.type ?? '',
        },
        mediaPrompt2: {
          url: question.prompt2?.fileString ?? '',
          type: question.prompt2?.type ?? '',
        },
        mediaPrompt3: {
          url: question.prompt3?.fileString ?? '',
          type: question.prompt3?.type ?? '',
        },
        questionType,
        multiChoiceOptions: question.multipleChoiceQuestionList,
        reorderSentenceQuestionList:
          question.reorderSentenceQuestionList as unknown as
            | { text: string }[]
            | undefined,
      })
      .pipe(
        tap((res) => {
          this.selectQuestion(question);

          // Apply AI teacher feedback:
          if (question.teacherFeedback) {
            this.feedbackForm.controls.teacherFeedback.setValue(
              res.feedback ?? ''
            );
            this.feedbackTextChange(res.feedback ?? '');
          }

          // Apply AI for audio and written response marking:
          if (['audio-response', 'written-response'].includes(questionType)) {
            this.feedbackForm.controls.vocabMark?.setValue(
              (res.mark as WrittenMark).vocabMark ?? 0
            );
            this.feedbackForm.controls.grammarMark?.setValue(
              (res.mark as WrittenMark).grammarMark ?? 0
            );
            this.feedbackForm.controls.contentMark?.setValue(
              (res.mark as WrittenMark).contentMark ?? 0
            );

            this.onMarkSelect(
              (res.mark as WrittenMark).vocabMark ?? 0,
              'vocabMark'
            );
            this.onMarkSelect(
              (res.mark as WrittenMark).grammarMark ?? 0,
              'grammarMark'
            );
            this.onMarkSelect(
              (res.mark as WrittenMark).contentMark ?? 0,
              'contentMark'
            );
          }

          // Apply audio specific ai marking:
          if (
            ['audio-response', 'repeat-sentence', 'read-outloud'].includes(
              questionType
            )
          ) {
            this.feedbackForm.controls.pronunciationMark?.setValue(
              (res.mark as AudioMark).pronunciationMark ?? 0
            );
            this.feedbackForm.controls.fluencyMark?.setValue(
              (res.mark as AudioMark).fluencyMark ?? 0
            );

            this.onMarkSelect(
              (res.mark as AudioMark).pronunciationMark ?? 0,
              'pronunciationMark'
            );
            this.onMarkSelect(
              (res.mark as AudioMark).fluencyMark ?? 0,
              'fluencyMark'
            );
          }

          // Apply repeat sentence ai marking:
          if (['repeat-sentence', 'read-outloud'].includes(questionType)) {
            this.feedbackForm.controls.accuracyMark?.setValue(
              (res.mark as RepeatSentenceMark).accuracyMark ?? 0
            );

            this.onMarkSelect(
              (res.mark as RepeatSentenceMark).accuracyMark ?? 0,
              'accuracyMark'
            );
          }
        }),
        map(() => {
          // Transform the result to void since we don't need the actual response here
        })
      );
  }

  /*
   * Navigate, start and end questions/sections:
   */
  selectQuestion(question: ExamQuestionDto): void {
    this.currentQuestionDisplay = question;
    let index = NaN;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (question.parent) {
      const parent = this.questionList.find(
        (obj) => obj._id === question.parent
      );
      if (parent?.subQuestions) {
        index = parent.subQuestions.findIndex(
          (obj) => obj._id === this.currentQuestionDisplay?._id
        );
        this.currentSubQuestionIndex = index;
      }
      const parentIndex = this.questionList.findIndex(
        (obj) => obj._id === parent?._id
      );
      this.currentQuestionIndex = parentIndex;
    } else {
      index = this.questionList.findIndex(
        (obj) => obj._id === this.currentQuestionDisplay?._id
      );
      this.currentQuestionIndex = index;
    }

    // update the feedback form:
    if (this.data.markMode) {
      this.populateFeedbackForm();
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
        (obj) => obj._id === this.currentQuestionDisplay?.parent
      );
      if (parent?.subQuestions) {
        this.currentQuestionDisplay =
          parent.subQuestions[this.currentSubQuestionIndex];
      }
    }

    // update the feedback form:
    if (this.data.markMode) {
      this.populateFeedbackForm();
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
        (obj) => obj._id === this.currentQuestionDisplay?.parent
      );
      if (parent?.subQuestions) {
        this.currentQuestionDisplay =
          parent.subQuestions[this.currentSubQuestionIndex];
      }
    }

    // update the feedback form:
    if (this.data.markMode) {
      this.populateFeedbackForm();
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
      (obj) => obj._id === this.currentQuestionDisplay?.parent
    );
    let index = NaN;
    if (parent?.subQuestions) {
      index = parent.subQuestions.findIndex(
        (obj) => obj._id === this.currentQuestionDisplay?._id
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
  isLastQuestion(): boolean {
    const index = this.questionList.findIndex(
      (obj) => obj._id === this.currentQuestionDisplay?._id
    );
    if (index === this.questionList.length - 1) {
      return true;
    } else {
      return false;
    }
  }

  /*
   * Get the index of the parent (section) of the current sub question:
   */
  isLastParentQuestion(): boolean {
    const index = this.questionList.findIndex(
      (obj) => obj._id === this.currentQuestionDisplay?.parent
    );
    if (index === this.questionList.length - 1) {
      return true;
    } else {
      return false;
    }
  }

  /*
   * Populate the teacher feebcack form on init:
   */
  populateFeedbackForm(): void {
    const studentResponse = this.currentQuestionDisplay?.studentResponse?.find(
      (obj) => obj.studentId === this.data.studentId
    );

    // Initialize FormGroup
    const formControls = {
      teacherFeedback: new FormControl(
        {
          value: studentResponse?.feedback?.text ?? '',
          disabled: this.data.currentUser?.userType.toLowerCase() === 'student',
        },
        {
          validators: [Validators.required, this.maxFeedbackLengthValidator()],
          nonNullable: true,
        }
      ),
    };

    // add content, grammar and vocabMark
    if (
      ['audio-response', 'written-response'].includes(
        this.currentQuestionDisplay?.type ?? ''
      )
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (formControls as any).vocabMark = new FormControl(
        {
          value: Number(studentResponse?.mark?.vocabMark ?? ''),
          disabled: this.data.currentUser?.userType.toLowerCase() === 'student',
        },
        { validators: [Validators.required], nonNullable: true }
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (formControls as any).grammarMark = new FormControl(
        {
          value: Number(studentResponse?.mark?.grammarMark ?? ''),
          disabled: this.data.currentUser?.userType.toLowerCase() === 'student',
        },
        { validators: [Validators.required], nonNullable: true }
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (formControls as any).contentMark = new FormControl(
        {
          value: Number(studentResponse?.mark?.contentMark ?? ''),
          disabled: this.data.currentUser?.userType.toLowerCase() === 'student',
        },
        { validators: [Validators.required], nonNullable: true }
      );
    }

    // Add fluencyMark and pronunciationMark
    if (
      ['audio-response', 'repeat-sentence', 'read-outloud'].includes(
        this.currentQuestionDisplay?.type ?? ''
      )
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (formControls as any).fluencyMark = new FormControl(
        {
          value: Number(studentResponse?.mark?.fluencyMark ?? ''),
          disabled: this.data.currentUser?.userType.toLowerCase() === 'student',
        },
        { validators: [Validators.required], nonNullable: false }
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (formControls as any).pronunciationMark = new FormControl(
        {
          value: Number(studentResponse?.mark?.pronunciationMark ?? ''),
          disabled: this.data.currentUser?.userType.toLowerCase() === 'student',
        },
        { validators: [Validators.required], nonNullable: false }
      );
    }

    // Add accuracyMark
    if (
      ['repeat-sentence', 'read-outloud'].includes(
        this.currentQuestionDisplay?.type ?? ''
      )
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (formControls as any).accuracyMark = new FormControl(
        {
          value: Number(studentResponse?.mark?.accuracyMark ?? ''),
          disabled: this.data.currentUser?.userType.toLowerCase() === 'student',
        },
        { validators: [Validators.required], nonNullable: false }
      );
    }

    // Set the form controls to the FormGroup
    this.feedbackForm = new FormGroup(formControls);
    this.feedbackFormPopulated.next(true);
  }

  /*
   * Changes to the student's response are emitted from the app-question component and updated here:
   */
  updateStudentResponse(response: string): void {
    const foundQuestion = this.findCurrentQuestionFromList();
    if (foundQuestion) {
      if (!foundQuestion.studentResponse) {
        foundQuestion.studentResponse = [];
      }

      const studentResponse = foundQuestion.studentResponse.find(
        (obj) => obj.studentId === this.data.currentUser?._id
      );
      if (!studentResponse) {
        foundQuestion.studentResponse.push({
          response,
          studentId: this.data.currentUser?._id,
        });
      } else {
        studentResponse.response = response;
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
      teacher: this.data.currentUser!._id,
    };
  }

  /*
   * When the teacher selects a mark for the student's question in the marking table, save the result locally and update the current question
   */
  onMarkSelect(level: number, category: string): void {
    const studentResponse = this.findCurrentStudentReponse() ?? {};
    studentResponse.mark = studentResponse.mark ?? {};
    studentResponse.mark[category] = level;
    const marksArray: number[] = [];
    const questionType = this.currentQuestionDisplay?.type?.toLowerCase();

    if (questionType) {
      if (['audio-response', 'written-response'].includes(questionType)) {
        marksArray.push(
          ...[
            studentResponse.mark.vocabMark ?? 0,
            studentResponse.mark.grammarMark ?? 0,
            studentResponse.mark.contentMark ?? 0,
          ].map(Number)
        );
      }

      if (
        ['audio-response', 'repeat-sentence', 'read-outloud'].includes(
          questionType
        )
      ) {
        marksArray.push(
          ...[
            studentResponse.mark.pronunciationMark ?? 0,
            studentResponse.mark.fluencyMark ?? 0,
          ].map(Number)
        );
      }

      if (['repeat-sentence', 'read-outloud'].includes(questionType)) {
        marksArray.push(
          ...[studentResponse.mark.accuracyMark ?? 0].map(Number)
        );
      }
    }

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
    const studentScore = this.data.exam.studentsCompleted.find(
      (studentCompleted) => studentCompleted.studentId === this.data.studentId
    );
    if (studentScore) {
      studentScore.mark = totalScaledMark;
    }

    // update the feedback form:
    this.updateForm();
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
    // --- determine if there is missing feedback:
    const missingFeedback: string[] = [];
    for (const question of this.questionList) {
      const studentResponse = question.studentResponse?.find(
        (obj) => obj.studentId === this.data.studentId
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
            (obj) => obj.studentId === this.data.currentUser?._id
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
              this.data.currentUser?._id,
              this.data.exam._id,
              this.data.studentId,
              this.getScaledTotalExamScore().toString(),
              undefined // indicates that Ai marking has not been done on this req
            )
            .subscribe({
              next: () => {
                this.snackbarService.open(
                  'info',
                  'Your feedback has been submitted. Thank you.'
                );
                this.dialogRef.close(true);
              },
              error: (error: Error) => {
                this.error = error;
                this.snackbarService.openPermanent('error', error.message);
              },
            });
        }
      });
    } else {
      //
      // --- If there is no missing feedback, submit feedback:
      this.questionService
        .submitTeacherFeedback(
          this.questionList,
          this.data.currentUser?._id,
          this.data.exam._id,
          this.data.studentId,
          this.getScaledTotalExamScore().toString(),
          undefined // indicates that Ai marking has not been done on this req
        )
        .subscribe({
          next: () => {
            this.snackbarService.open(
              'info',
              'Your feedback has been submitted. Thank you.'
            );
            this.dialogRef.close(true);
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

    // check to see if there are missing answers before completing the exam:
    for (const question of this.questionList) {
      const studentResponse = question.studentResponse?.find(
        (obj) => obj.studentId === this.data.currentUser?._id
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
            (obj) => obj.studentId === this.data.currentUser?._id
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

    // Warn student about unanswered quesitons before submitting:
    if (missingAnswers.length > 0) {
      let message = 'The following questions have not been answered';
      if (missingAnswers.length === 1) {
        message = 'The following question has not been answered';
      }
      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Wait! You have not answered all the questions.',
          message: `${message}: <br> <br> 
            <b>${missingAnswers.join(
              ',<br>'
            )}. </b> <br> <br> If you submit your exam without answering a question, you will be given a score of 0 for that question.`,
          okLabel: `Submit`,
          cancelLabel: `Return`,
          routerLink: '',
        },
      });
      confirmDialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          this.submitExam();
        }
      });
    }

    // If no unanswered questions, submit exam:
    else {
      this.submitExam();
    }
  }

  submitExam(): void {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Are you sure you want to submit your exam?',
        message:
          "Once you submit your exam, you won't be able to edit your answers.",
        okLabel: 'Submit',
        cancelLabel: `Return`,
        routerLink: '',
      },
    });
    confirmDialogRef.afterClosed().subscribe((result) => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access
      if (result === true) {
        this.submitExamLoading = true;
        this.questionService
          .submitStudentResponse(
            this.questionList,
            this.data.currentUser?._id,
            this.data.exam._id
          )
          .pipe(
            finalize(() => {
              this.submitExamLoading = false;
            }),
            untilDestroyed(this)
          )
          .subscribe({
            next: () => {
              this.snackbarService.open('info', 'Exam completed! Well done.');
              this.dialogRef.close(true);
            },
            error: (error: Error) => {
              this.error = error;
              this.snackbarService.openPermanent('error', error.message);
            },
          });
      }
    });
  }

  /*
   * Before submitting the exam, validate the student's responses and disable submit if errors
   */
  invalidStudentResponses(): boolean {
    let invalid = false;
    for (const question of this.questionList) {
      const studentResponse = question.studentResponse?.find(
        (response) => response.studentId === this.data.currentUser?._id
      );

      // if written response exceeds word limit:
      if (
        question.type === 'written-response' &&
        (studentResponse?.response?.trim().split(/\s+/u).length ?? 0) >
          (question.length ?? 600)
      ) {
        invalid = true;
      }
    }
    return invalid;
  }

  /*
   * Before submitting the review, validate the teacher's feedback and disable submit if errors
   */
  invalidTeacherFeedback(): boolean {
    let invalid = false;
    for (const question of this.questionList) {
      const teacherFeedback = question.studentResponse?.find(
        (response) => response.studentId === this.data.studentId
      )?.feedback?.text;

      if (
        question.type === 'written-response' &&
        (teacherFeedback?.trim().split(/\s+/u).length ?? 0) >
          this.maxFeedbackWordLimit
      ) {
        invalid = true;
      }
    }
    return invalid;
  }

  /*
     *Custom validator for teacher feedback word length:
     todo - move to global directive or helper
     */
  maxFeedbackLengthValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const input = control.value as string | undefined;

      if (
        (input?.trim().split(/\s+/u).length ?? 600) > this.maxFeedbackWordLimit
      ) {
        return { tooManyWords: true };
      }
      return null;
    };
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
      feedbackForm.vocabMark?.setValue(
        Number(studentResponse?.mark?.vocabMark ?? '')
      );
      feedbackForm.grammarMark?.setValue(
        Number(studentResponse?.mark?.grammarMark ?? '')
      );
      feedbackForm.contentMark?.setValue(
        Number(studentResponse?.mark?.contentMark ?? '')
      );
      feedbackForm.pronunciationMark?.setValue(
        Number(studentResponse?.mark?.pronunciationMark ?? '')
      );
      feedbackForm.fluencyMark?.setValue(
        Number(studentResponse?.mark?.fluencyMark ?? '')
      );
      feedbackForm.accuracyMark?.setValue(
        Number(studentResponse?.mark?.accuracyMark ?? '')
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
        (obj) => obj.studentId === this.data.studentId
      );
    }
    return studentResponse;
  }

  /*
   * Get the student's mark for the question
   */
  getStudentMark(
    question: ExamQuestionDto
  ): string | number | null | undefined {
    if (question.type?.toLocaleUpperCase() !== 'section') {
      const studentResponse = question.studentResponse?.find(
        (response) => response.studentId === this.data.studentId
      );
      return studentResponse?.mark?.totalMark;
    } else {
      const subQuestion = this.questionList.find(
        (obj) => obj._id === question._id
      );
      const studentResponse = subQuestion?.studentResponse?.find(
        (obj) => obj.studentId === this.data.studentId
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
      (response) => response?.studentId === this.data.studentId
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
      this.data.exam.totalPointsMin ?? 0,
      this.data.exam.totalPointsMax ?? 100
    );
    return totalScaledMark;
  }

  getMarkingCategories(): { displayName: string; value: string }[] {
    const markingCategories = [];

    if (this.currentQuestionDisplay?.type === 'written-response') {
      markingCategories.push(
        { displayName: 'Vocabulary and Spelling', value: 'vocabMark' },
        { displayName: 'Grammar and Punctuation', value: 'grammarMark' },
        { displayName: 'Content', value: 'contentMark' }
      );
    }

    if (this.currentQuestionDisplay?.type === 'audio-response') {
      markingCategories.push(
        { displayName: 'Vocabulary', value: 'vocabMark' },
        { displayName: 'Grammar', value: 'grammarMark' },
        { displayName: 'Content', value: 'contentMark' },
        {
          displayName: 'Flueny',
          value: 'fluencyMark',
        },
        {
          displayName: 'Pronuciation',
          value: 'pronunciationMark',
        }
      );
    }

    if (
      ['repeat-sentence', 'read-outloud'].includes(
        this.currentQuestionDisplay?.type ?? ''
      )
    ) {
      markingCategories.push(
        {
          displayName: 'Accuracy',
          value: 'accuracyMark',
        },
        {
          displayName: 'Flueny',
          value: 'fluencyMark',
        },
        {
          displayName: 'Pronuciation',
          value: 'pronunciationMark',
        }
      );
    }

    return markingCategories;
  }

  /*
   * Find the current exam question from the questionList
   * todo - move to seperate reusable service or helper.
   */
  findCurrentQuestionFromList(): ExamQuestionDto | undefined {
    let foundQuestion;
    if (
      this.currentQuestionDisplay?.parent !== null &&
      this.currentQuestionDisplay !== null
    ) {
      foundQuestion = this.questionList
        .find((obj) => obj._id === this.currentQuestionDisplay?.parent)
        ?.subQuestions?.find(
          (obj) => obj._id === this.currentQuestionDisplay?._id
        );
    } else {
      foundQuestion = this.questionList.find(
        (obj) => obj._id === this.currentQuestionDisplay?._id
      );
    }
    return foundQuestion;
  }

  closeDialog(result: boolean | null): void {
    if (
      this.data.currentUser?.userType.toLowerCase() === 'student' &&
      !this.data.displayMode &&
      !this.data.markMode
    ) {
      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title:
            'Wait! Are you sure you want to exit the exam without submitting it?',
          message:
            'You have not submitted your exam. Your answers will not be saved/submitted if you exit now.',
          okLabel: 'Exit Exam',
          cancelLabel: `Return to Exam`,
          routerLink: '',
        },
      });
      confirmDialogRef.afterClosed().subscribe((res) => {
        if (res) {
          this.dialogRef.close();
        }
      });
    } else if (
      ['teacher', 'admin', 'school'].includes(
        this.data.currentUser?.userType.toLowerCase() ?? ''
      ) &&
      !this.data.displayMode &&
      this.data.markMode
    ) {
      const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title:
            'Wait! Are you sure you want to exit the exam without saving your feedback?',
          message:
            'You have not saved your feedback/marking changes. Your feedback/marking changes will not be saved if you exit now. To save/submit your feedback and marking changes, navigate to the last question and click the Submit button.',
          okLabel: 'Exit Exam Marking',
          cancelLabel: `Return to Marking`,
          routerLink: '',
        },
      });
      confirmDialogRef.afterClosed().subscribe((res) => {
        if (res) {
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close(result);
    }
  }
}
