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

@Component({
  selector: 'app-create-exam-dialog',
  templateUrl: './create-exam-dialog.component.html',
  styleUrls: ['./create-exam-dialog.component.scss'],
})
export class CreateExamDialogComponent implements OnInit {
  error: Error;
  @Output() saveExam = new EventEmitter<ExamDTO>();
  examForm: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    instructions: FormControl<string>;
    casualPrice: FormControl<number>;
    default: FormControl<boolean>;
    assignedTeacher: FormControl<string>;
    defaultExam: FormControl<boolean>;
  }>;
  questionList: QuestionList[] = [];
  currentQuestionDisplay: QuestionList | null = null;
  imagePromptFile = '';
  audioPromptFile = '';
  sectionCounter = 1; // used to assign an id to a new section;
  questionCounter = 1; //  used to assign an id to a new question;
  letters: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); // used for labelling options in multiple choice questions;

  questionForm: FormGroup<{
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
    randomQuestionOrder: FormControl<boolean | null>; // for multiple choice question, the questions will be in random order
    partialMarking: FormControl<boolean | null>; // for fill-in-blanks question, partial marks will be awarded if he user gets some of the questions correct
    // caseSensitive: FormControl<boolean | null>; // for fill-in-blanks question, the student will have to get the case correct to score the points
    length: FormControl<number | null>; // word limit for written questions and time limit (seconds) for audio questions
    answers?: FormControl<{ question: string; correct: boolean }[] | null>; // used for multiple choice questions
  }>;

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
    { type: 'reorder-sentence', description: '', label: 'Reorder Sentence' },
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
    this.populateExamForm();
    this.populateQuestionForm();
  }

  populateExamForm(): void {
    this.examForm = new FormGroup({
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
  }

  populateQuestionForm(): void {
    this.questionForm = new FormGroup({
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
      randomQuestionOrder: new FormControl(false, {
        nonNullable: false,
      }),
      partialMarking: new FormControl(false, {
        nonNullable: false,
      }),
      time: new FormControl(60, {
        nonNullable: false,
      }),
      totalPoints: new FormControl(1, {
        nonNullable: true,
      }),
    });
    this.formPopulated.next(true);
  }

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

  editQuestion(question: QuestionList, subQuestion: QuestionList | null): void {
    if (!subQuestion) {
      this.currentQuestionDisplay = question;
    } else {
      this.currentQuestionDisplay = subQuestion;
      this.currentQuestionDisplay.parent = question.id as number;
    }
    this.updateForm();
  }

  updateForm(): void {
    if (this.currentQuestionDisplay) {
      this.questionForm.controls.questionName.setValue(
        this.currentQuestionDisplay.name
      );
      this.questionForm.controls.writtenPrompt.setValue(
        this.currentQuestionDisplay.writtenPrompt ?? ''
      );
      this.questionForm.controls.type.setValue(
        this.currentQuestionDisplay.type ?? ''
      );
      this.questionForm.controls.teacherFeedback.setValue(
        this.currentQuestionDisplay.teacherFeedback ?? false
      );
      this.questionForm.controls.autoMarking.setValue(
        this.currentQuestionDisplay.autoMarking ?? false
      );
      this.questionForm.controls.imagePrompt.setValue(
        this.currentQuestionDisplay.imagePrompt ?? ''
      );
      this.questionForm.controls.videoPrompt.setValue(
        this.currentQuestionDisplay.videoPrompt ?? ''
      );
      this.questionForm.controls.audioPrompt.setValue(
        this.currentQuestionDisplay.audioPrompt ?? ''
      );
      this.questionForm.controls.length.setValue(
        this.currentQuestionDisplay.length ?? NaN
      );
      this.questionForm.controls.totalPoints.setValue(
        this.currentQuestionDisplay.totalPoints ?? NaN
      );
      this.questionForm.controls.time.setValue(
        this.currentQuestionDisplay.time ?? null
      );
      this.questionForm.controls.randomQuestionOrder.setValue(
        this.currentQuestionDisplay.randomQuestionOrder ?? false
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
          this.questionForm.controls.length.setValue(NaN);
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
        this.currentQuestionDisplay.partialMarking = null;
        this.currentQuestionDisplay.randomQuestionOrder = null;
      }
    }
  }

  changeMultiChoice(index: number, checked: boolean): void {
    if (
      this.currentQuestionDisplay?.type === 'multiple-choice-single' &&
      this.currentQuestionDisplay.multipleChoiceQuestionList
    ) {
      for (const question of this.currentQuestionDisplay
        .multipleChoiceQuestionList) {
        question.correct = false;
      }
    }
    if (this.currentQuestionDisplay?.multipleChoiceQuestionList) {
      this.currentQuestionDisplay.multipleChoiceQuestionList[index].correct =
        checked;
    }
  }

  changeMatchOptionText(index: number, text: string, option: string): void {
    if (this.currentQuestionDisplay?.matchOptionQuestionList) {
      if (option === 'right') {
        this.currentQuestionDisplay.matchOptionQuestionList[index].rightOption =
          text;
      }
      if (option === 'left') {
        this.currentQuestionDisplay.matchOptionQuestionList[index].leftOption =
          text;
      }
    }
  }

  changeMultiChoiceText(index: number, text: string): void {
    if (this.currentQuestionDisplay?.multipleChoiceQuestionList) {
      this.currentQuestionDisplay.multipleChoiceQuestionList[index].text = text;
    }
  }

  changeReorderSentenceText(index: number, text: string): void {
    if (this.currentQuestionDisplay?.reorderSentenceQuestionList) {
      this.currentQuestionDisplay.reorderSentenceQuestionList[index] = text;
    }
  }

  changeFillBlankText(index: number, text: string): void {
    if (this.currentQuestionDisplay?.fillBlanksQuestionList) {
      this.currentQuestionDisplay.fillBlanksQuestionList[index].text = text;
    }
  }

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

  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.imagePromptFile = input.files[0].name;
  //   }
  // }

  expandSection(question: QuestionList): void {
    const clickedQuestion = this.questionList.find(
      (obj) => obj.id === question.id
    );
    if (clickedQuestion?.expanded !== undefined) {
      clickedQuestion.expanded = !clickedQuestion.expanded;
    }
  }

  addMultipleChoiceOption(): void {
    if (
      this.currentQuestionDisplay &&
      !this.currentQuestionDisplay.multipleChoiceQuestionList
    ) {
      this.currentQuestionDisplay.multipleChoiceQuestionList = [
        {
          text: '',
          correct: false,
        },
      ];
    } else {
      this.currentQuestionDisplay?.multipleChoiceQuestionList?.push({
        text: '',
        correct: false,
      });
    }
  }

  addReorderSentenceOption(): void {
    if (
      this.currentQuestionDisplay &&
      !this.currentQuestionDisplay.reorderSentenceQuestionList
    ) {
      this.currentQuestionDisplay.reorderSentenceQuestionList = [''];
    } else {
      this.currentQuestionDisplay?.reorderSentenceQuestionList?.push('');
    }
  }

  addFillBlank(option: string): void {
    if (
      this.currentQuestionDisplay &&
      !this.currentQuestionDisplay.fillBlanksQuestionList
    ) {
      if (option === 'blank') {
        this.currentQuestionDisplay.fillBlanksQuestionList = [
          { text: '', blank: true },
        ];
      } else {
        this.currentQuestionDisplay.fillBlanksQuestionList = [
          { text: '', blank: false },
        ];
      }
    } else if (option === 'blank') {
      this.currentQuestionDisplay?.fillBlanksQuestionList?.push({
        text: '',
        blank: true,
      });
    } else {
      this.currentQuestionDisplay?.fillBlanksQuestionList?.push({
        text: '',
        blank: false,
      });
    }
  }

  addMatchOption(): void {
    if (
      this.currentQuestionDisplay &&
      !this.currentQuestionDisplay.matchOptionQuestionList
    ) {
      this.currentQuestionDisplay.matchOptionQuestionList = [
        {
          rightOption: '',
          leftOption: '',
        },
      ];
    } else {
      this.currentQuestionDisplay?.matchOptionQuestionList?.push({
        rightOption: '',
        leftOption: '',
      });
    }
  }

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
        this.examForm.get('default')?.patchValue(false);
      }
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
  multipleChoiceQuestionList?: { text: string; correct: boolean }[] | null;
  reorderSentenceQuestionList?: string[] | null;
  fillBlanksQuestionList?: { text: string; blank: boolean }[] | null;
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
