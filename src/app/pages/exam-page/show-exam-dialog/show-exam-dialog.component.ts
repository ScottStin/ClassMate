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
  EssayMark,
  RepeatSentenceMark,
  WrittenMark,
} from 'src/app/services/ai-exam-question-feedback-service/ai-exam-question-feedback.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { QuestionService } from 'src/app/services/question-service/question.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { demoLevels } from 'src/app/shared/demo-data';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import {
  ExamQuestionDto,
  ExamQuestionTypes,
  StudentQuestionResponse,
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
    structureMark?: FormControl<number | undefined>;
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
      currentUser?: UserDTO;
    },
    private readonly dialogRef: MatDialogRef<ShowExamDialogComponent>,
    private readonly questionService: QuestionService,
    private readonly aiExamQuestionFeedbackService: AiExamQuestionFeedbackService,
    private readonly snackbarService: SnackbarService,
    private readonly notificationService: NotificationService,
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
      const aiMarkingQuestions = [
        // top-level questions with autoMarking
        ...this.questionList.filter((question) => question.autoMarking),

        // subQuestions from section-type questions
        ...this.questionList
          .filter(
            (question) =>
              question.type === 'section' &&
              question.subQuestions &&
              question.subQuestions.length > 0
          )
          .flatMap(
            (question) =>
              question.subQuestions?.filter(
                (subQuestion) => subQuestion.autoMarking
              )
          ),
      ];

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
                  this.snackbarService.queueBar(
                    'warn',
                    "Ai marking and feedback for this student's exam has been saved. Please review the marking/feedback carefully, as the Ai is not perfect and can sometimes make mistakes."
                  );
                },
                error: (error: Error) => {
                  this.error = error;
                  this.snackbarService.queueBar('error', error.message);
                },
              });
          },
          error: (error: Error) => {
            this.error = error;
            this.snackbarService.queueBar('error', error.message);
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

  markAiQuestion(question?: ExamQuestionDto): Observable<void> {
    if (!question) {
      return of();
    }

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
        'match-options',
        'fill-in-the-blanks',
        'fill-in-blanks-select',
        'essay',
      ].includes(questionType)
    ) {
      return of();
    }

    // --- Generate Ai Feedback:
    return this.aiExamQuestionFeedbackService
      .generateAiFeedbackExamQuestion({
        question,
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
        matchOptionQuestionList: question.matchOptionQuestionList,
        fillBlanksQuestionList: question.fillBlanksQuestionList,
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
          if (
            ['audio-response', 'written-response', 'essay'].includes(
              questionType
            )
          ) {
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

          // Apply repeat sentence ai marking:
          if (['essay'].includes(questionType)) {
            this.feedbackForm.controls.structureMark?.setValue(
              (res.mark as EssayMark).structureMark ?? 0
            );

            this.onMarkSelect(
              (res.mark as EssayMark).structureMark ?? 0,
              'structureMark'
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

  // Note - this logic can be used if we're returning our sub questions for this exam form the backend separately from the parent question in questionList
  // completeSection(): void {
  //   const parentId = this.currentQuestionDisplay?.parent;
  //   const parent = this.questionList.find(
  //     (question) => question._id === parentId
  //   );
  //   const parentSubQuestionLength = parent?.subQuestions?.length;

  //   this.currentQuestionIndex =
  //     this.currentQuestionIndex + (parentSubQuestionLength ?? 0) + 1;
  //   this.currentQuestionDisplay = this.questionList[this.currentQuestionIndex];
  // }

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
   * Populate the teacher feedback form on init:
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
      ['audio-response', 'written-response', 'essay'].includes(
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

    // add structureMark
    if (['essay'].includes(this.currentQuestionDisplay?.type ?? '')) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (formControls as any).structureMark = new FormControl(
        {
          value: Number(studentResponse?.mark?.structureMark ?? ''),
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
    const studentResponse = this.findCurrentStudentResponse() ?? {};
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
    const studentResponse = this.findCurrentStudentResponse() ?? {};
    studentResponse.mark = studentResponse.mark ?? {};
    studentResponse.mark[category] = level;
    const marksArray: number[] = [];
    const questionType = this.currentQuestionDisplay?.type?.toLowerCase();

    if (questionType) {
      if (
        ['audio-response', 'written-response', 'essay'].includes(questionType)
      ) {
        marksArray.push(
          ...[
            studentResponse.mark.vocabMark ?? 0,
            studentResponse.mark.grammarMark ?? 0,
            studentResponse.mark.contentMark ?? 0,
          ].map(Number)
        );
      }

      if (['essay'].includes(questionType)) {
        marksArray.push(
          ...[studentResponse.mark.structureMark ?? 0].map(Number)
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
  onSubmitFeedbackClick(): void {
    //
    // --- determine if there is missing feedback:

    const missingFeedback: string[] = [];
    for (const question of this.questionList) {
      const studentResponse = question.studentResponse?.find(
        (response) => response.studentId === this.data.studentId
      );
      if (
        (!studentResponse?.mark || !studentResponse.feedback?.text) &&
        question.teacherFeedback === true
      ) {
        [missingFeedback.push(question.name)];
      }
      if (
        question.type === 'section' &&
        question.subQuestions &&
        question.subQuestions.length > 0
      ) {
        for (const subQuestion of question.subQuestions) {
          const studentResponseSubQuestion = subQuestion.studentResponse?.find(
            (response) => response.studentId === this.data.studentId
          );
          if (
            (!studentResponseSubQuestion?.mark ||
              !studentResponseSubQuestion.feedback?.text) &&
            subQuestion.teacherFeedback === true
          ) {
            missingFeedback.push(`${question.name}, ${subQuestion.name}`);
          }
        }
      }
    }

    // --- If there is no missing feedback, submit feedback:
    if (missingFeedback.length < 1) {
      this.submitFeedback();
      return;
    }

    // --- If there is missing feedback:
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
      if (result === true) {
        this.submitFeedback();
      }
    });
  }

  submitFeedback(): void {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Submit feedback?',
        message:
          'Are you sure you want to submit your feedback? Don’t worry — you’ll still be able to edit it later.',
        okLabel: 'Submit',
        cancelLabel: `Return`,
        routerLink: '',
      },
    });

    confirmDialogRef.afterClosed().subscribe((result) => {
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
              this.snackbarService.queueBar(
                'info',
                'Your feedback has been submitted. Thank you.'
              );

              // --- create notification:
              this.notificationService
                .create({
                  recipients: [this.data.studentId],
                  message: `Your exam has been marked. Click here to view your feedback.`,
                  createdBy: this.data.currentUser?._id ?? '',
                  dateSent: new Date().getTime(),
                  seenBy: [],
                  schoolId: this.data.exam.schoolId ?? '',
                  link: 'exams',
                })
                .pipe(untilDestroyed(this))
                .subscribe();

              this.dialogRef.close(true);
            },
            error: (error: Error) => {
              this.error = error;
              this.snackbarService.queueBar('error', error.message);
            },
          });
      }
    });
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
        !studentResponse?.response &&
        !['section', 'information-page'].includes(question.type ?? '')
      ) {
        [missingAnswers.push(question.name)];
      }
      if (
        question.type === 'section' &&
        question.subQuestions &&
        question.subQuestions.length > 0
      ) {
        for (const subQuestion of question.subQuestions) {
          const studentResponseSubQuestion = subQuestion.studentResponse?.find(
            (obj) => obj.studentId === this.data.currentUser?._id
          );
          if (
            !studentResponseSubQuestion?.response &&
            !['section', 'information-page'].includes(subQuestion.type ?? '')
          ) {
            missingAnswers.push(`${question.name}, ${subQuestion.name}`);
          }
        }
      }
    }

    // Warn student about unanswered questions before submitting:
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
              this.snackbarService.queueBar(
                'info',
                'Exam completed! Well done.'
              );

              // --- create notification:
              this.notificationService
                .create({
                  recipients: [this.data.exam.assignedTeacherId],
                  message: `A student has completed one of your exams and is awaiting marking.`,
                  createdBy: this.data.currentUser?._id ?? '',
                  dateSent: new Date().getTime(),
                  seenBy: [],
                  schoolId: this.data.exam._id,
                  link: 'exams',
                })
                .pipe(untilDestroyed(this))
                .subscribe();

              this.dialogRef.close(true);
            },
            error: (error: Error) => {
              this.error = error;
              this.snackbarService.queueBar('error', error.message);
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
        ['written-response', 'essay'].includes(question.type ?? '') &&
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
        ['written-response', 'essay'].includes(question.type ?? '') &&
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
    const studentResponse = this.findCurrentStudentResponse();
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
      feedbackForm.structureMark?.setValue(
        Number(studentResponse?.mark?.structureMark ?? '')
      );
    }
  }

  /*
   * Get the student's response to the question
   */
  findCurrentStudentResponse(): StudentQuestionResponse | undefined {
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
  getStudentMark(question: ExamQuestionDto): string | undefined {
    if (question.type?.toLocaleUpperCase() !== 'section') {
      const studentResponse = question.studentResponse?.find(
        (response) => response.studentId === this.data.studentId
      );
      const mark = Number(studentResponse?.mark?.totalMark);
      return isNaN(mark)
        ? (question.totalPointsMin ?? 0).toString()
        : mark.toFixed(1);
    } else {
      const subQuestion = this.questionList.find(
        (obj) => obj._id === question._id
      );
      const studentResponse = subQuestion?.studentResponse?.find(
        (obj) => obj.studentId === this.data.studentId
      );
      const mark = Number(studentResponse?.mark?.totalMark);
      return isNaN(mark)
        ? (question.totalPointsMin ?? 0).toString()
        : mark.toFixed(1);
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

    if (
      ['written-response', 'essay'].includes(
        this.currentQuestionDisplay?.type ?? ''
      )
    ) {
      markingCategories.push(
        { displayName: 'Vocabulary and Spelling', value: 'vocabMark' },
        { displayName: 'Grammar and Punctuation', value: 'grammarMark' },
        { displayName: 'Content', value: 'contentMark' }
      );
    }

    if (['essay'].includes(this.currentQuestionDisplay?.type ?? '')) {
      markingCategories.push({
        displayName: 'Structure and Organisation',
        value: 'structureMark',
      });
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
          displayName: 'Fluency',
          value: 'fluencyMark',
        },
        {
          displayName: 'Pronunciation',
          value: 'pronunciationMark',
        }
      );
    }

    return markingCategories;
  }

  /*
   * Find the current exam question from the questionList
   * todo - move to separate reusable service or helper.
   */
  findCurrentQuestionFromList(): ExamQuestionDto | undefined {
    let foundQuestion;

    if (this.currentQuestionDisplay?.parent) {
      foundQuestion = this.questionList
        .find(
          (question) => question._id === this.currentQuestionDisplay?.parent
        )
        ?.subQuestions?.find(
          (subQuestion) => subQuestion._id === this.currentQuestionDisplay?._id
        );
    } else {
      foundQuestion = this.questionList.find(
        (question) => question._id === this.currentQuestionDisplay?._id
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
