/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { ExamService } from 'src/app/services/exam-service/exam.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { CreateFillBlanksExamQuestionDialogComponent } from './create-fill-blanks-exam-question-dialog/create-fill-blanks-exam-question-dialog.component';
import { CreateMultipleChoiceExamQuestionDialogComponent } from './create-multiple-choice-exam-question-dialog/create-multiple-choice-exam-question-dialog.component';
import { CreateReorderSentenceExamQuestionDialogComponent } from './create-reorder-sentence-exam-question-dialog/create-reorder-sentence-exam-question-dialog.component';
import { CreateMatchOptionsExamQuestionDialogComponent } from './match-options-exam-question-dialog/create-match-options-exam-question-dialog.component';

@Component({
  selector: 'app-create-exam-dialog',
  templateUrl: './create-exam-dialog.component.html',
  styleUrls: ['./create-exam-dialog.component.scss'],
})
export class CreateExamDialogComponent implements OnInit {
  @Output() saveExam = new EventEmitter<ExamDTO>();
  error: Error;

  examForm: FormGroup<{
    examDetailsStep: ExamDetailStepForm;
    questionStep: QuestionStepForm;
  }>;

  questionList: QuestionList[] = [];
  currentQuestionDisplay: QuestionList | null = null;
  imagePromptFile = '';
  audioPromptFile = '';
  sectionCounter = 1; // used to assign an id to a new section;
  questionCounter = 1; //  used to assign an id to a new question;
  scrollThroughQuestionListStyling = '';

  questionTypes: { type: string; description: string; label: string }[] = [
    { type: 'written-response', description: '', label: 'Written Response' },
    { type: 'audio-response', description: '', label: 'Audio Response' },
    {
      type: 'repeat-sentence',
      description: '',
      label: 'Audio response - repeat word/sentence/paragraph',
    },
    {
      type: 'multiple-choice-single',
      description: '',
      label: 'Multiple Choice Single Answer',
    },
    {
      type: 'multiple-choice-multi',
      description: '',
      label: 'Multiple Choice Multiple Answer',
    },
    {
      type: 'reorder-sentence',
      description: '',
      label: 'Reorder Sentence/Paragraph',
    },
    { type: 'match-options', description: '', label: 'Match Options' },
    {
      type: 'fill-in-the-blanks',
      description: '',
      label: 'Fill in the Blanks',
    },
    { type: 'information-page', description: '', label: 'Information Page' },
    { type: 'section', description: '', label: 'Section' },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      exam: ExamDTO | undefined;
      teachers: UserDTO[];
    },
    private readonly dialogRef: MatDialogRef<CreateExamDialogComponent>,
    private readonly examService: ExamService,
    private readonly snackbarService: SnackbarService,
    public dialog: MatDialog
  ) {}

  formPopulated = new Subject<boolean>();

  ngOnInit(): void {
    this.populateForm();
  }

  /*
   * Populate the exam form on page load:
   */
  populateForm(): void {
    const examDetailsStep = new FormGroup({
      name: new FormControl(this.data.exam?.name ?? '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      description: new FormControl(this.data.exam?.description ?? '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      instructions: new FormControl(this.data.exam?.instructions ?? '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      casualPrice: new FormControl(this.data.exam?.casualPrice ?? NaN, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      default: new FormControl(this.data.exam?.default ?? false, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      defaultExam: new FormControl(this.data.exam?.default ?? false, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      assignedTeacher: new FormControl(this.data.exam?.assignedTeacher ?? '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
    });
    this.formPopulated.next(true);

    const questionStep = new FormGroup({
      questionName: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      type: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      writtenPrompt: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      imagePrompt: new FormControl('', {
        nonNullable: false,
      }),
      videoPrompt: new FormControl('', {
        nonNullable: false,
      }),
      audioPrompt: new FormControl('', {
        nonNullable: false,
      }),
      length: new FormControl(NaN, {
        nonNullable: false,
      }),
      teacherFeedback: new FormControl(false, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      autoMarking: new FormControl(false, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      time: new FormControl(60, {
        nonNullable: false,
      }),
      totalPoints: new FormControl(1, {
        nonNullable: true,
      }),
    });

    this.examForm = new FormGroup({
      examDetailsStep,
      questionStep,
    });

    this.formPopulated.next(true);
  }

  /*
   * Adds a new section to the exam question list:
   */
  addNewSection(): void {
    const newQuestion = {
      name: `New section ${this.sectionCounter}`,
      type: 'section',
      expanded: false,
      id: `section-${this.sectionCounter}`,
      subQuestions: [
        {
          name: `New section ${this.sectionCounter}, Q1`,
        },
      ],
    };
    this.questionList.push(newQuestion);
    this.currentQuestionDisplay = newQuestion;
    this.sectionCounter = this.sectionCounter + 1;
    this.updateForm();
  }

  /*
   * Adds a question to the questin list:
   */
  addNewQuestion(): void {
    const newQuestion = {
      name: `New question ${this.questionCounter}`,
      type: 'question',
      id: `question-${this.questionCounter}`,
    };
    this.questionList.push(newQuestion);
    this.currentQuestionDisplay = newQuestion;
    this.questionCounter = this.questionCounter + 1;
    this.updateForm();
  }

  /*
   * Adds a subquestion to a section:
   */
  addQuestionToSection(question: QuestionList): void {
    const clickedQuestion = this.questionList.find(
      (obj) => obj.id === question.id
    );
    if (clickedQuestion?.subQuestions) {
      this.questionList

        .find((obj) => obj.id === question.id)
        ?.subQuestions?.push({
          name: `${clickedQuestion.name} q${
            clickedQuestion.subQuestions.length + 2
          }`,
          id: `${clickedQuestion.name} q${
            clickedQuestion.subQuestions.length + 2
          }`,
        });
      this.currentQuestionDisplay = clickedQuestion;
    }
    this.updateForm();
  }

  /*
   * When the user clicks to edit a question in the question list, make that the current question to display:
   */
  editQuestion(question: QuestionList, subQuestion: QuestionList | null): void {
    if (!subQuestion) {
      //
      // --- First, let's create a scroll effect, so it looks like we're scrolling up/down through the question list when the user changes questions, rather than just changing immediately:
      const newQuestionIndex = this.questionList.findIndex(
        (questionListItem) => question.id === questionListItem.id
      );
      const currentQuestionIndex = this.questionList.findIndex(
        (questionListItem) =>
          this.currentQuestionDisplay?.id === questionListItem.id
      );

      // eslint-disable-next-line require-await
      const delay = async (ms: number): Promise<void> =>
        new Promise((resolve) => setTimeout(resolve, ms));

      const updateQuestionDisplay = async (): Promise<void> => {
        if (currentQuestionIndex > newQuestionIndex) {
          // Loop backward with delay:
          for (let i = currentQuestionIndex - 1; i >= newQuestionIndex; i--) {
            this.scrollThroughQuestionListStyling =
              'transform: translateY(2000px); transition: all 0.05s ease-in-out;';
            this.currentQuestionDisplay = this.questionList[i];
            await delay(25);
            this.scrollThroughQuestionListStyling =
              'transform: translateY(0px); transition: all 0.05s ease-in-out;';
            await delay(25);
            this.updateForm();
          }
        } else if (currentQuestionIndex < newQuestionIndex) {
          // Loop forward with delay:
          for (let i = currentQuestionIndex + 1; i <= newQuestionIndex; i++) {
            this.scrollThroughQuestionListStyling =
              'transform: translateY(-2000px); transition: all 0.05s ease-in-out;';
            this.currentQuestionDisplay = this.questionList[i];
            await delay(25);
            this.scrollThroughQuestionListStyling =
              'transform: translateY(0px); transition: all 0.05s ease-in-out;';
            await delay(25);
            this.updateForm();
          }
        }
      };
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      updateQuestionDisplay();
    } else {
      // todo - add loop to sub question display as above:
      this.currentQuestionDisplay = subQuestion;
      this.currentQuestionDisplay.parent = question.id as number;
      this.updateForm();
    }
  }

  /*
   * When the current question being displayed to the user changes, update the question form:
   */
  updateForm(): void {
    if (this.currentQuestionDisplay) {
      const questionForm = this.examForm.controls.questionStep;

      questionForm.controls.questionName.setValue(
        this.currentQuestionDisplay.name
      );
      questionForm.controls.writtenPrompt.setValue(
        this.currentQuestionDisplay.writtenPrompt ?? ''
      );
      questionForm.controls.type.setValue(
        this.currentQuestionDisplay.type ?? ''
      );
      questionForm.controls.teacherFeedback.setValue(
        this.currentQuestionDisplay.teacherFeedback ?? false
      );
      questionForm.controls.autoMarking.setValue(
        this.currentQuestionDisplay.autoMarking ?? false
      );
      questionForm.controls.imagePrompt.setValue(
        this.currentQuestionDisplay.imagePrompt ?? ''
      );
      questionForm.controls.videoPrompt.setValue(
        this.currentQuestionDisplay.videoPrompt ?? ''
      );
      questionForm.controls.audioPrompt.setValue(
        this.currentQuestionDisplay.audioPrompt ?? ''
      );
      questionForm.controls.length.setValue(
        this.currentQuestionDisplay.length ?? NaN
      );
      questionForm.controls.totalPoints.setValue(
        this.currentQuestionDisplay.totalPoints ?? NaN
      );
      questionForm.controls.time.setValue(
        this.currentQuestionDisplay.time ?? null
      );
    }
  }

  formChange(text: string | boolean, field: string): void {
    if (this.currentQuestionDisplay?.parent !== undefined) {
      const foundQuestion = this.questionList
        .find((obj) => obj.id === this.currentQuestionDisplay?.parent)
        ?.subQuestions?.find(
          (obj) => obj.id === this.currentQuestionDisplay?.id
        );
      if (foundQuestion) {
        foundQuestion[field] = text;
      }
    } else {
      const foundQuestion = this.questionList.find(
        (obj) => obj.id === this.currentQuestionDisplay?.id
      );
      if (foundQuestion) {
        foundQuestion[field] = text;
      }
    }
    if (field === 'type') {
      if (this.currentQuestionDisplay) {
        if (this.currentQuestionDisplay.fillBlanksQuestionList) {
          this.currentQuestionDisplay.fillBlanksQuestionList = null;
        }
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (this.currentQuestionDisplay.length) {
          this.currentQuestionDisplay.length = null;
          this.examForm.controls.questionStep.controls.length.setValue(NaN);
        }
        if (this.currentQuestionDisplay.matchOptionQuestionList) {
          this.currentQuestionDisplay.matchOptionQuestionList = null;
        }
        if (this.currentQuestionDisplay.multipleChoiceQuestionList) {
          this.currentQuestionDisplay.multipleChoiceQuestionList = null;
        }
        if (this.currentQuestionDisplay.reorderSentenceQuestionList) {
          this.currentQuestionDisplay.reorderSentenceQuestionList = null;
        }
      }
    }
  }

  /*
   * Delete a question from the question list:
   */
  deleteQuestion(
    question: QuestionList,
    subQuestions: QuestionList | null
  ): void {
    if (subQuestions !== null) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.questionList.find(
        (obj: QuestionList) => obj.id === question.id
      )!.subQuestions = this.questionList
        .find((obj: QuestionList) => obj.id === question.id)
        ?.subQuestions?.filter((obj: QuestionList) => obj !== subQuestions);
    } else {
      this.questionList = this.questionList.filter((obj) => obj !== question);
    }
    this.currentQuestionDisplay = null;
  }

  /*
   * When the user clicks on a seciton in the question list, expand that section to show the sub-questions:
   */
  expandSection(question: QuestionList): void {
    const clickedQuestion = this.questionList.find(
      (obj) => obj.id === question.id
    );
    if (clickedQuestion?.expanded !== undefined) {
      clickedQuestion.expanded = !clickedQuestion.expanded;
    }
  }

  /*
   * Change the default level test (toggle on/off):
   */
  updateDefaultExam(): void {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Change default exam?`,
        message: `The default exam is a level test assigned to the students when they first sign up to the platform. You can only have one default exam at a time. If you make this your new default exam, it will be assigned to all new students who sign up. The default exam for students who signed up previously will not change, however.`,
        okLabel: `Continue`,
        cancelLabel: `Cancel`,
        routerLink: '',
      },
    });
    confirmDialogRef.afterClosed().subscribe((result: boolean) => {
      if (!result) {
        this.examForm.controls.examDetailsStep
          .get('default')
          ?.patchValue(false);
      }
    });
  }

  /*
   * Open multiple chouce dialog to add multiple choice options to question:
   */
  openQuestionDetailDialog(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dialogName: any;
    let title;
    let questionType: string;

    // Create data for dialog:
    if (this.currentQuestionDisplay?.type === 'reorder-sentence') {
      dialogName = CreateReorderSentenceExamQuestionDialogComponent;
      title = 'Create Reorder Sentence/Paragraph Exam Question';
      questionType = 'reorderSentenceQuestionList';
    }

    if (this.currentQuestionDisplay?.type === 'match-options') {
      dialogName = CreateMatchOptionsExamQuestionDialogComponent;
      title = 'Create Match Option Exam Question';
      questionType = 'matchOptionQuestionList';
    }

    if (this.currentQuestionDisplay?.type === 'fill-in-the-blanks') {
      dialogName = CreateFillBlanksExamQuestionDialogComponent;
      title = 'Create Fill-in-the-Blanks Exam Question';
      questionType = 'fillBlanksQuestionList';
    }

    if (
      ['multiple-choice-single', 'multiple-choice-multi'].includes(
        this.currentQuestionDisplay?.type ?? ''
      )
    ) {
      dialogName = CreateMultipleChoiceExamQuestionDialogComponent;
      title =
        this.currentQuestionDisplay?.type === 'multiple-choice-single'
          ? 'Create Multiple Choice (Single Answer) Exam Question'
          : 'Create Multiple Choice (Multiple Answer) Exam Question';
      questionType = 'multipleChoiceQuestionList';
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const dialogRef = this.dialog.open(dialogName, {
      data: {
        title,
        currentQuestionDisplay: this.currentQuestionDisplay,
      },
    });
    dialogRef.afterClosed().subscribe((result: QuestionList | null) => {
      if (result) {
        let foundQuestion;
        if (this.currentQuestionDisplay?.parent !== undefined) {
          // If current question in a subquestion of a section, update accordingly:
          foundQuestion = this.questionList
            .find((obj) => obj.id === this.currentQuestionDisplay?.parent)
            ?.subQuestions?.find(
              (obj) => obj.id === this.currentQuestionDisplay?.id
            );
        } else {
          // If current question is not a sub question, update accordingly:
          foundQuestion = this.questionList.find(
            (question) => question.id === result.id
          );
        }

        // apply results:
        if (foundQuestion && questionType) {
          foundQuestion[questionType] = result[questionType];
          foundQuestion.randomQuestionOrder = result.randomQuestionOrder;
          foundQuestion.partialMarking = result.partialMarking;
          foundQuestion.caseSensitive = result.caseSensitive;
        }
      }
    });
  }

  /*
   * Finally, when the user is finished, we save the exam:
   */
  saveExamClick(): void {
    // this.saveExam.emit(this.examForm.value as ExamDTO);
    this.examService
      .create(this.examForm.value as ExamDTO, this.questionList)
      .subscribe({
        next: () => {
          this.snackbarService.open('info', 'Exam successfully created');
          this.closeDialog(true);
        },
        error: (error: Error) => {
          this.error = error;
          this.snackbarService.openPermanent('error', error.message);
        },
      });
  }

  closeDialog(result: boolean | null): void {
    this.dialogRef.close(result);
  }
}

export interface QuestionList {
  // todo = move this to models.
  name: string;
  subQuestions?: QuestionList[] | null;
  writtenPrompt?: string | null;
  teacherFeedback?: boolean | null;
  autoMarking?: boolean | null;
  type?: string;
  timed?: boolean | null;
  time?: number | null;
  randomQuestionOrder?: boolean | null;
  partialMarking?: boolean | null;
  caseSensitive?: boolean | null; // for fill-in-blanks question, the student will have to get the case correct to score the points
  multipleChoiceQuestionList?: { text: string; correct: boolean }[] | null; // todo - seperate
  reorderSentenceQuestionList?: { text: string }[] | null;
  fillBlanksQuestionList?:
    | { text: string; blanks: { text: string }[] }[]
    | null;
  matchOptionQuestionList?:
    | { leftOption: string; rightOption: string }[]
    | null;
  audioPrompt?: string | null;
  totalPoints?: number | null;
  length?: number | null;
  videoPrompt?: string | null;
  imagePrompt?: string | null;
  expanded?: boolean;
  id?: number | string;
  parent?: number | null;
  [key: string]: unknown;
  studentResponse?: {
    student?: string | null;
    response?: string | null;
    mark?: number | string | null;
    feedback?: { text: string; teacher: string } | null;
  }[];
}
[];

export type ExamDetailStepForm = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
  instructions: FormControl<string>;
  casualPrice: FormControl<number>;
  default: FormControl<boolean>;
  assignedTeacher: FormControl<string>;
  defaultExam: FormControl<boolean>;
}>;

export type QuestionStepForm = FormGroup<{
  questionName: FormControl<string>;
  writtenPrompt: FormControl<string>; // a short description of the question task
  time: FormControl<number | null>; // question time limit (seconds)
  type: FormControl<string>;
  imagePrompt: FormControl<string | null>; // a visual prompt for the question
  audioPrompt: FormControl<string | null>; // an audio prompt for the question
  videoPrompt: FormControl<string | null>; // a video prompt for the question
  teacherFeedback: FormControl<boolean>; // true = teacher has to give feedback
  autoMarking: FormControl<boolean>; // false = teacher has to assign mark
  totalPoints: FormControl<number>;
  length: FormControl<number | null>; // word limit for written questions and time limit (seconds) for audio questions
  answers?: FormControl<{ question: string; correct: boolean }[] | null>; // used for multiple choice questions
}>;
