import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
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
    casualPrice: FormControl<number>;
    default: FormControl<boolean>;
    assignedTeacher: FormControl<string>;
    defaultExam: FormControl<boolean>;
  }>;
  demoQuestions: QuestionList[] = [];

  questionForm: FormGroup<{
    questionName: FormControl<string>;
    writtenPrompt?: FormControl<string | null>; // a short description of the question task
    time?: FormControl<number | null>; // question time limit (seconds)
    type: FormControl<string>;
    imagePrompt?: FormControl<string | null>; // a visual prompt for the question
    audioPrompt?: FormControl<string | null>; // an audio prompt for the question
    videoPrompt?: FormControl<string | null>; // a video prompt for the question
    teacherFeedback: FormControl<boolean>; // true = teacher has to give feedback
    autoMarking: FormControl<boolean>; // false = teacher has to assign mark
    totalPoints?: FormControl<number | null>;
    randomQuestionOrder?: FormControl<boolean | null>; // for multiple choiuce question, the questions will be in random order
    length?: FormControl<number | null>; // word limit for written questions and time limit (seconds) for audio questions
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
    { type: 'multiple-choice', description: '', label: 'Multiple Choice' },
    { type: 'reorder-sentence', description: '', label: 'Reorder Sentence' },
    { type: 'match-options', description: '', label: 'Match Options' },
    {
      type: 'fill-in-the-blanks',
      description: '',
      label: 'Fill in the Blanks',
    },
    { type: 'information-page', description: '', label: 'Information Page' },
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
    private readonly snackbarService: SnackbarService
  ) {}

  formPopulated = new Subject<boolean>();

  ngOnInit(): void {
    this.populateExamForm();
    this.populateQuestionForm();

    this.demoQuestions = [
      {
        name: 'section1',
        type: 'section',
        expanded: false,
        id: 1,
        subQuestions: [
          { name: 'section1 q1' },
          { name: 'section1 q2' },
          { name: 'section1 q3' },
          { name: 'section1 q3' },
          { name: 'section1 q5' },
        ],
      },
      {
        name: 'section2',
        type: 'section',
        expanded: false,
        id: 2,
        subQuestions: [
          { name: 'section2 q1' },
          { name: 'section2 q2' },
          { name: 'section2 q3' },
          { name: 'section2 q3' },
          { name: 'section2 q5' },
        ],
      },
      { name: 'question3', type: 'question', subQuestions: null, id: 4 },
      { name: 'question4', type: 'question', subQuestions: null, id: 5 },
    ];
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
      teacherFeedback: new FormControl(false, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      autoMarking: new FormControl(false, {
        validators: [Validators.required],
        nonNullable: true,
      }),
    });
    this.formPopulated.next(true);
  }

  saveExamClick(): void {
    console.log(this.examForm);
    // this.saveExam.emit(this.examForm.value as ExamDTO);
    this.examService.create(this.examForm.value as ExamDTO).subscribe({
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
    this.demoQuestions.push({
      name: `New section ${this.demoQuestions.length + 2}`,
      type: 'section',
      expanded: true,
      id: this.demoQuestions.length + 2,
      subQuestions: [
        {
          name: `New section ${this.demoQuestions.length + 2}, Q1`,
        },
      ],
    });
  }

  addNewQuestion(): void {
    this.demoQuestions.push({
      name: `New question ${this.demoQuestions.length + 2}`,
      type: 'question',
      id: this.demoQuestions.length + 2,
    });
  }

  addQuestionToSection(question: QuestionList): void {
    const clickedQuestion = this.demoQuestions.find(
      (obj) => obj.id === question.id
    );
    if (clickedQuestion?.subQuestions) {
      this.demoQuestions
        .find((obj) => obj.id === question.id)
        ?.subQuestions?.push({
          name: `${clickedQuestion.name} q${
            clickedQuestion.subQuestions.length + 2
          }`,
        });
    }
  }

  deleteQuestion(
    question: QuestionList,
    subQuestions: QuestionList | null
  ): void {
    if (subQuestions !== null) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.demoQuestions.find(
        (obj: QuestionList) => obj.id === question.id
      )!.subQuestions = this.demoQuestions
        .find((obj: QuestionList) => obj.id === question.id)
        ?.subQuestions?.filter((obj: QuestionList) => obj !== subQuestions);
    } else {
      this.demoQuestions = this.demoQuestions.filter((obj) => obj !== question);
    }
  }

  expandSection(question: QuestionList): void {
    const clickedQuestion = this.demoQuestions.find(
      (obj) => obj.id === question.id
    );
    console.log(clickedQuestion);
    if (clickedQuestion?.expanded !== undefined) {
      clickedQuestion.expanded = !clickedQuestion.expanded;
    }
  }

  closeDialog(result: boolean | null): void {
    this.dialogRef.close(result);
  }
}

export interface QuestionList {
  name: string;
  subQuestions?: QuestionList[] | null;
  type?: string;
  expanded?: boolean;
  id?: number;
}
[];
