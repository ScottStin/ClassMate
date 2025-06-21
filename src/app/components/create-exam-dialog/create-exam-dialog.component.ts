/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
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
import { finalize, Subject } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { ExamService } from 'src/app/services/exam-service/exam.service';
import {
  readOutloudQuestionPrompt,
  repeatSentenceQuestionPrompt,
} from 'src/app/services/question-service/question.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import {
  CreateExamQuestionDto,
  ExamQuestionTypes,
} from 'src/app/shared/models/question.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { PreviewExamQuestionComponent } from '../preview-exam-question/preview-exam-question.component';
import { CreateFillBlanksExamQuestionDialogComponent } from './create-fill-blanks-exam-question-dialog/create-fill-blanks-exam-question-dialog.component';
import { CreateMatchOptionsExamQuestionDialogComponent } from './create-match-options-exam-question-dialog/create-match-options-exam-question-dialog.component';
import { CreateMultipleChoiceExamQuestionDialogComponent } from './create-multiple-choice-exam-question-dialog/create-multiple-choice-exam-question-dialog.component';
import { CreateReorderSentenceExamQuestionDialogComponent } from './create-reorder-sentence-exam-question-dialog/create-reorder-sentence-exam-question-dialog.component';

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

  questionList: CreateExamQuestionDto[] = [];
  currentQuestionDisplay: CreateExamQuestionDto | null = null;
  maxWrittenResponseWordLimit = 600;
  maxAudioResponseTimeLimit = 120;
  sectionCounter = 1; // used to assign an id to a new section;
  questionCounter = 1; //  used to assign an id to a new question;
  createExamLoading = false;
  changingQuestions = false; // note: users were having trouble seeing if a question had changed because it was happening too fast, so changingQuestions is used to add an affect when the question changes
  readOutloudQuestionPrompt = readOutloudQuestionPrompt;

  fileChangedEvent: Event | string = '';
  fileLinkPrompt1: string | null | undefined;
  fileNamePrompt1 = '';
  fileLinkPrompt2: string | null | undefined;
  fileNamePrompt2 = '';
  fileLinkPrompt3: string | null | undefined;
  fileNamePrompt3 = '';

  questionTypes: {
    type: ExamQuestionTypes;
    description: string;
    label: string;
  }[] = [
    {
      type: 'written-response',
      description:
        'Student must write a response to one or more prompts. The student will be marked on 3 categories: vocab/spelling, grammar/punctuation, and content (how accurately they address the prompt(s)). The student will have a given word limit.',
      label: 'Written Response',
    },
    {
      type: 'audio-response',
      description:
        'Student must give spoken response to one or more prompts. The student will be marked on 5 categories: vocabulary, grammar, pronunciation, fluency, and content (how accurately they address the prompt(s)). The student will have a given time limit in which they must respond.',
      label: 'Audio Response',
    },
    {
      type: 'repeat-sentence',
      description:
        'The student will hear an audio recording of word, phrase, paragraph or sentence, and they must repeat what they hear. The student will be marked on 3 categories: accuracy, pronunciation and fluency.',
      label: 'Audio response - repeat word/sentence/paragraph',
    },
    {
      type: 'read-outloud',
      description:
        'The student will be provided with a text and must read it out loud. The student will be marked on 3 categories: accuracy, pronunciation and fluency.',
      label: 'Audio response - read out loud',
    },
    {
      type: 'multiple-choice-single',
      description:
        'This is a multiple choice question where only one answer is correct. The student is marked on accuracy.',
      label: 'Multiple Choice Single Answer',
    },
    {
      type: 'multiple-choice-multi',
      description:
        'This is a multiple choice question where multiple answers may be correct. The student is marked on accuracy, and the teacher can choose if the student can be award partial marks for only getting some items correct, or the student must get all items correct to be awarded the marks.',
      label: 'Multiple Choice Multiple Answer',
    },
    {
      type: 'reorder-sentence',
      description:
        'The student provided with texts that are out of order, and must drop and drag the text to place them in the correct order. The student is marked on accuracy, and the teacher can choose if the student can be award partial marks for only getting some items correct, or the student must get all items correct to be awarded the marks.',
      label: 'Reorder Sentence/Paragraph',
    },
    {
      type: 'match-options',
      description:
        'The student is given two columns of items and must match the items in the left column to the correct items in the right column. The student is marked on accuracy, and the teacher can choose if the student can be award partial marks for only getting some items correct, or the student must get all items correct to be awarded the marks.',
      label: 'Match Options',
    },
    {
      type: 'fill-in-the-blanks',
      description:
        'The student is given one or more texts and must complete the missing blanks.',
      label: 'Fill in the Blanks',
    },
    {
      type: 'essay',
      description:
        'The student must write an essay on one or more give prompt(s). This is different from a written-response question, as the student will be marked on different categories. For an essay question, the student will be marked on 4 categories: vocab/spelling, grammar/punctuation, structure of the essay, and content. The student will have a given word limit.',
      label: 'Essay',
    },
    {
      type: 'information-page',
      description:
        'This is just an information page that provides the student with context or instructions to the exam or for an upcoming question/section. It has no marking.',
      label: 'Information Page',
    },
    { type: 'section', description: '', label: 'Section' },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      exam: ExamDTO | undefined;
      teachers: UserDTO[];
      currentTeacher: UserDTO;
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
      totalPointsMin: new FormControl(this.data.exam?.totalPointsMin ?? 0, {
        nonNullable: true,
      }),
      totalPointsMax: new FormControl(this.data.exam?.totalPointsMax ?? 100, {
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
      assignedTeacherId: new FormControl(
        this.data.exam?.assignedTeacherId ?? // on edit exam, set the assigned teacher
          (this.data.currentTeacher.userType.toLowerCase() === 'teacher' // if user creating the exam is not admin, assigned teacher should be current teacher by default
            ? this.data.currentTeacher._id
            : ''),
        {
          validators: [Validators.required],
          nonNullable: true,
        }
      ),
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
      totalPointsMin: new FormControl(0, {
        nonNullable: true,
      }),
      totalPointsMax: new FormControl(5, {
        nonNullable: true,
      }),

      prompt1: new FormControl('', {
        // validators: [this.validUrl()],
        validators: [],
        nonNullable: false,
      }),
      prompt1Type: new FormControl('', {
        nonNullable: false,
      }),
      prompt2: new FormControl('', {
        validators: [],
        nonNullable: false,
      }),
      prompt2Type: new FormControl('', {
        nonNullable: false,
      }),
      prompt3: new FormControl('', {
        validators: [],
        nonNullable: false,
      }),
      prompt3Type: new FormControl('', {
        nonNullable: false,
      }),

      length: new FormControl(NaN, {
        validators: [this.maxLengthValidator()],
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
    this.changingQuestions = true;
    const newQuestion: CreateExamQuestionDto = {
      name: `New section ${this.sectionCounter}`,
      type: 'section',
      expanded: false,
      tempId: `section-${this.sectionCounter}`,
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
    this.changingQuestions = true;
    const newQuestion: CreateExamQuestionDto = {
      name: `New question ${this.questionCounter}`,
      type: 'question',
      tempId: `question-${this.questionCounter}`,
    };
    this.questionList.push(newQuestion);
    this.currentQuestionDisplay = newQuestion;
    this.questionCounter = this.questionCounter + 1;
    this.updateForm();
  }

  /*
   * Adds a subquestion to a section:
   */
  addQuestionToSection(question: CreateExamQuestionDto): void {
    this.changingQuestions = true;
    const clickedQuestion = this.questionList.find(
      (obj) => obj.tempId === question.tempId
    );
    if (clickedQuestion?.subQuestions) {
      this.questionList

        .find((obj) => obj.tempId === question.tempId)
        ?.subQuestions?.push({
          name: `${clickedQuestion.name} q${
            clickedQuestion.subQuestions.length + 2
          }`,
          tempId: `${clickedQuestion.name} q${
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
  editQuestion(
    question: CreateExamQuestionDto,
    subQuestion: CreateExamQuestionDto | null
  ): void {
    this.changingQuestions = true;
    if (!subQuestion) {
      this.currentQuestionDisplay = question;
    } else {
      this.currentQuestionDisplay = subQuestion;
      this.currentQuestionDisplay.parent = question.tempId;
    }

    this.updateForm();
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

      questionForm.controls.prompt1.setValue(
        this.currentQuestionDisplay.prompt1?.fileString ?? null
      );
      questionForm.controls.prompt1Type.setValue(
        this.currentQuestionDisplay.prompt1?.type ?? null
      );
      questionForm.controls.prompt2.setValue(
        this.currentQuestionDisplay.prompt2?.fileString ?? null
      );
      questionForm.controls.prompt2Type.setValue(
        this.currentQuestionDisplay.prompt2?.type ?? null
      );
      questionForm.controls.prompt3.setValue(
        this.currentQuestionDisplay.prompt3?.fileString ?? null
      );
      questionForm.controls.prompt3Type.setValue(
        this.currentQuestionDisplay.prompt3?.type ?? null
      );

      questionForm.controls.length.setValue(
        this.currentQuestionDisplay.length ?? NaN
      );
      questionForm.controls.totalPointsMin.setValue(
        this.currentQuestionDisplay.totalPointsMin ?? 0
      );
      questionForm.controls.totalPointsMax.setValue(
        this.currentQuestionDisplay.totalPointsMax ?? 10
      );
      questionForm.controls.time.setValue(
        this.currentQuestionDisplay.time ?? null
      );

      // update prompt attachement strings/names:
      this.fileLinkPrompt1 = this.currentQuestionDisplay.prompt1?.fileString;
      this.fileNamePrompt1 =
        this.currentQuestionDisplay.prompt1?.fileName ?? '';
      this.fileLinkPrompt2 = this.currentQuestionDisplay.prompt2?.fileString;
      this.fileNamePrompt2 =
        this.currentQuestionDisplay.prompt2?.fileName ?? '';
      this.fileLinkPrompt3 = this.currentQuestionDisplay.prompt3?.fileString;
      this.fileNamePrompt3 =
        this.currentQuestionDisplay.prompt3?.fileName ?? '';
    }

    setTimeout(() => {
      this.changingQuestions = false;
    }, 100);
  }

  /*
   * Find the current quesiton being displayed in the questionList:
   * Todo - move to seperate reusable service or helper.
   */
  findCurrentQuestionFromList(): CreateExamQuestionDto | undefined {
    let foundQuestion;

    if (this.currentQuestionDisplay?.parent !== undefined) {
      foundQuestion = this.questionList
        .find((obj) => obj.tempId === this.currentQuestionDisplay?.parent)
        ?.subQuestions?.find(
          (obj) => obj.tempId === this.currentQuestionDisplay?.tempId
        );
    } else {
      foundQuestion = this.questionList.find(
        (obj) => obj.tempId === this.currentQuestionDisplay?.tempId
      );
    }

    return foundQuestion;
  }

  formChange(text: string | boolean, field: string): void {
    // --- Find the current question:
    const foundQuestion = this.findCurrentQuestionFromList();

    // --- update the current question:
    if (foundQuestion) {
      foundQuestion[field] = text;
    }

    // --- reset the form if type change:
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
          this.currentQuestionDisplay.matchOptionQuestionList = undefined;
        }
        if (this.currentQuestionDisplay.multipleChoiceQuestionList) {
          this.currentQuestionDisplay.multipleChoiceQuestionList = undefined;
        }
        if (this.currentQuestionDisplay.reorderSentenceQuestionList) {
          this.currentQuestionDisplay.reorderSentenceQuestionList = null;
        }

        this.examForm.controls.questionStep.controls.writtenPrompt.reset();
        this.examForm.controls.questionStep.controls.writtenPrompt.enable();
        this.currentQuestionDisplay.writtenPrompt = null;
      }

      // --- If prompt type is repeat sentence:
      if (this.currentQuestionDisplay?.type === 'repeat-sentence') {
        //
        // if no prompt1 for repeat sentence, add a new audio prompt
        if (!this.currentQuestionDisplay.prompt1) {
          this.addNewPrompt();
        }
        if (this.currentQuestionDisplay.prompt1?.type !== 'audio') {
          this.updatePromptType('audio', 'prompt1', true);
          this.examForm.controls.questionStep.controls.prompt1Type.setValue(
            'audio'
          );
        }

        // repeat sentence can only have one prompt, so remove the others:
        if (this.currentQuestionDisplay.prompt3) {
          this.removePrompt('prompt3');
        }
        if (this.currentQuestionDisplay.prompt2) {
          this.removePrompt('prompt2');
        }

        // set the written prompt:
        const writtenPrompt =
          this.currentQuestionDisplay.writtenPrompt ??
          repeatSentenceQuestionPrompt;
        this.currentQuestionDisplay.writtenPrompt = writtenPrompt;
        this.examForm.controls.questionStep.controls.writtenPrompt.setValue(
          writtenPrompt
        );
        this.examForm.controls.questionStep.controls.writtenPrompt.disable();
      }

      // --- If prompt type is read-outloud:
      if (this.currentQuestionDisplay?.type === 'read-outloud') {
        //
        // read outloud has no media prompts, so remove them:
        if (this.currentQuestionDisplay.prompt3) {
          this.removePrompt('prompt3');
        }
        if (this.currentQuestionDisplay.prompt2) {
          this.removePrompt('prompt2');
        }
        if (this.currentQuestionDisplay.prompt1) {
          this.removePrompt('prompt1');
        }

        // // Set the written prompt:
        // const writtenPrompt =
        //   this.currentQuestionDisplay.writtenPrompt ??
        //   "Read the given text out loud. Try your best to repeat it word for word. You won't be marked down for accent. You will only be marked on pronunciation, fluency and accuracy.";
        // this.currentQuestionDisplay.writtenPrompt = writtenPrompt;
        // this.examForm.controls.questionStep.controls.writtenPrompt.setValue(
        //   writtenPrompt
        // );
      }
    }

    if (field === 'autoMarking' && text === true) {
      this.snackbarService.openPermanent(
        'info',
        'Please note that you will be charged 5 cents per question that uses our automarking software. For example, if you have an exam that has 10 auto marked questions, you will be charged 50 cents per student who completes that exam (assuming that they complete all auto marked questions).'
      );
    }
  }

  /*
   * Delete a question from the question list:
   * todo - replace subQuestions/ question logic with findCurrentQuestionFromList
   */
  deleteQuestion(
    question: CreateExamQuestionDto,
    subQuestions: CreateExamQuestionDto | null
  ): void {
    if (subQuestions !== null) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.questionList.find(
        (obj: CreateExamQuestionDto) => obj.tempId === question.tempId
      )!.subQuestions = this.questionList
        .find((obj: CreateExamQuestionDto) => obj.tempId === question.tempId)
        ?.subQuestions?.filter(
          (obj: CreateExamQuestionDto) => obj !== subQuestions
        );
    } else {
      this.questionList = this.questionList.filter((obj) => obj !== question);
    }
    this.currentQuestionDisplay = null;
  }

  /**
   * Show a preview of what the current question will look like:
   */
  previewQuestion(): void {
    // Find the current question:
    const foundQuestion = this.findCurrentQuestionFromList();

    // open dialog:
    this.dialog.open(PreviewExamQuestionComponent, {
      data: {
        question: foundQuestion,
        placeholderUser: this.data.teachers[0],
      },
      // panelClass: 'fullscreen-dialog',
      // height: '95vh',
      autoFocus: false,
      hasBackdrop: true,
      disableClose: true,
    });
  }

  /*
   * When the user clicks on a seciton in the question list, expand that section to show the sub-questions:
   */
  expandSection(question: CreateExamQuestionDto): void {
    const clickedQuestion = this.questionList.find(
      (obj) => obj.tempId === question.tempId
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
    dialogRef
      .afterClosed()
      .subscribe((result: CreateExamQuestionDto | null) => {
        if (result) {
          const foundQuestion = this.findCurrentQuestionFromList();

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
   * Add/Remove/Update a new prompt to the exam question:
   */
  addNewPrompt(): void {
    const foundQuestion = this.findCurrentQuestionFromList();
    if (!foundQuestion) {
      return;
    }

    if (!foundQuestion.prompt1) {
      foundQuestion.prompt1 = { fileString: '', type: 'image', fileName: '' };
    } else if (!foundQuestion.prompt2) {
      foundQuestion.prompt2 = { fileString: '', type: 'image', fileName: '' };
    } else if (!foundQuestion.prompt3) {
      foundQuestion.prompt3 = { fileString: '', type: 'image', fileName: '' };
    }
  }

  removePrompt(promptName: 'prompt1' | 'prompt2' | 'prompt3'): void {
    const foundQuestion = this.findCurrentQuestionFromList();
    if (!foundQuestion) {
      return;
    }

    if (promptName === 'prompt1') {
      foundQuestion.prompt1 = null;
    }
    if (promptName === 'prompt2') {
      foundQuestion.prompt2 = null;
    }
    if (promptName === 'prompt3') {
      foundQuestion.prompt3 = null;
    }
  }

  async updatePrompt(
    event: Event,
    promptNumber: 'prompt1' | 'prompt2' | 'prompt3',
    promptTypeNumber: string // 'prompt1Type' | 'prompt2Type' | 'prompt3Type'
  ): Promise<void> {
    this.fileChangedEvent = event;
    const input = event.target as HTMLInputElement;
    if (input.files) {
      if (this.validateFile(input.files[0])) {
        if (promptNumber === 'prompt1') {
          this.fileNamePrompt1 = input.files[0].name;
        }
        if (promptNumber === 'prompt2') {
          this.fileNamePrompt2 = input.files[0].name;
        }
        if (promptNumber === 'prompt3') {
          this.fileNamePrompt3 = input.files[0].name;
        }
        await this.convertFileToBase64(input.files[0], promptNumber);

        const foundQuestion = this.findCurrentQuestionFromList();
        if (foundQuestion) {
          foundQuestion[promptNumber] = {
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style, prettier/prettier
            fileString: (promptNumber === 'prompt1' ? this.fileLinkPrompt1 : (this.fileLinkPrompt2 ?? '')) as string,
            type:
              this.examForm.controls.questionStep.getRawValue()[
                promptTypeNumber as 'prompt1Type' | 'prompt2Type'
              ] ?? '',
            fileName:
              promptNumber === 'prompt1'
                ? this.fileNamePrompt1
                : promptNumber === 'prompt2'
                ? this.fileNamePrompt2
                : this.fileNamePrompt3,
          };

          // Change prompt type to match uploaded file type:
          if (input.files[0].type.startsWith('image/')) {
            this.examForm.controls.questionStep.controls[
              promptTypeNumber as 'prompt1Type' | 'prompt2Type' | 'prompt3Type'
            ].setValue('image');
            this.updatePromptType('image', promptNumber, false);
          } else if (input.files[0].type.startsWith('audio/')) {
            this.examForm.controls.questionStep.controls[
              promptTypeNumber as 'prompt1Type' | 'prompt2Type' | 'prompt3Type'
            ].setValue('audio');
            this.updatePromptType('audio', promptNumber, false);
          }
        }
      }
    }
  }

  updatePromptType(
    promptType: string | null | undefined,
    promptNumber: 'prompt1' | 'prompt2' | 'prompt3',
    clear: boolean
  ): void {
    const foundQuestion = this.findCurrentQuestionFromList();
    if (foundQuestion) {
      if (promptNumber === 'prompt1') {
        if (clear) {
          this.fileNamePrompt1 = ''; // clear file when prompt type changes:
          this.fileLinkPrompt1 = '';
        }
        foundQuestion[promptNumber] = {
          fileString: this.fileLinkPrompt1 ?? '',
          type: (promptType ?? 'image').toLowerCase(),
          fileName: this.fileNamePrompt1,
        };
      }

      if (promptNumber === 'prompt2') {
        if (clear) {
          this.fileNamePrompt2 = ''; // clear file when prompt type changes:
          this.fileLinkPrompt2 = '';
        }
        foundQuestion[promptNumber] = {
          fileString: this.fileLinkPrompt2 ?? '',
          type: (promptType ?? 'image').toLowerCase(),
          fileName: this.fileNamePrompt2,
        };
      }

      if (promptNumber === 'prompt3') {
        if (clear) {
          this.fileNamePrompt3 = ''; // clear file when prompt type changes:
          this.fileLinkPrompt3 = '';
        }
        foundQuestion[promptNumber] = {
          fileString: this.fileLinkPrompt3 ?? '',
          type: (promptType ?? 'image').toLowerCase(),
          fileName: this.fileNamePrompt3,
        };
      }
    }
  }

  /*
   * Handle file upload and validation:
   */

  // todo = move to shared service or directive
  // eslint-disable-next-line require-await
  async convertFileToBase64(file: File, promptNumber: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (): void => {
        if (promptNumber === 'prompt1') {
          this.fileLinkPrompt1 = reader.result as string;
        }
        if (promptNumber === 'prompt2') {
          this.fileLinkPrompt2 = reader.result as string;
        }
        if (promptNumber === 'prompt3') {
          this.fileLinkPrompt3 = reader.result as string;
        }
        resolve(); // Resolves the promise once the file is converted
      };
      reader.onerror = (): void => {
        reject(new Error('Failed to read file.'));
      };
      reader.readAsDataURL(file);
    });
  }

  // todo = move to shared service or directive
  validateFile(file: File): boolean {
    const types = [
      'image/png',
      'image/gif',
      'image/tiff',
      'image/jpeg',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
    ]; // todo - this should validate image and audio uploads seperately
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const maxSize = 1000 * 1024 * 10; // 10,000 KB
    if (!types.includes(file.type)) {
      this.snackbarService.openPermanent(
        'error',
        'File must be an either a png, gif, tiff, jpeg, mpeg, wav, or ogg type',
        'dismiss'
      );
      return false;
    }
    if (file.size > maxSize) {
      this.snackbarService.openPermanent(
        'error',
        'File must be 1-10,000 kb in size',
        'dismiss'
      );
      return false;
    }

    return true;
  }

  /*
   *Custom url validator for question prompts:
   * Not needed since we've changed the prompts from url link to file
   */

  // validUrl(): ValidatorFn {
  //   return (control: AbstractControl): Record<string, unknown> | null => {
  //     const urlInput = control.value as string;

  //     if (!urlInput) {
  //       return null; // Allow blank url field;
  //     }

  //     try {
  //       // eslint-disable-next-line no-new
  //       new URL(urlInput);
  //       return null;
  //     } catch {
  //       return { invalidUrl: true };
  //     }
  //   };
  // }

  /*
   *Custom validator for length of written and audio responses:
   todo - move to global directive or helper
   */
  maxLengthValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const input = control.value as number;

      if (
        ['audio-response', 'repeat-sentence', 'written-response'].includes(
          this.currentQuestionDisplay?.type ?? ''
        ) &&
        !input
      ) {
        return { required: true };
      }

      if (
        this.currentQuestionDisplay?.type === 'written-response' &&
        input > this.maxWrittenResponseWordLimit
      ) {
        return { tooManyWords: true };
      }

      if (
        this.currentQuestionDisplay?.type === 'written-response' &&
        input < 1
      ) {
        return { tooFewWords: true };
      }

      if (
        ['audio-response', 'repeat-sentence'].includes(
          this.currentQuestionDisplay?.type ?? ''
        ) &&
        input > this.maxAudioResponseTimeLimit
      ) {
        return { tooLong: true };
      }

      if (
        ['audio-response', 'repeat-sentence'].includes(
          this.currentQuestionDisplay?.type ?? ''
        ) &&
        input < 1
      ) {
        return { tooShort: true };
      }

      return null;
    };
  }

  /*
   * Finally, when the user is finished, we save the exam:
   */
  saveExamClick(): void {
    this.createExamLoading = true;
    this.saveExam.emit(this.examForm.value as ExamDTO);
    this.examService
      .create(
        this.examForm.controls.examDetailsStep.value as ExamDTO,
        this.questionList
      )
      .pipe(
        finalize(() => {
          this.createExamLoading = false;
        })
      )
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

export type ExamDetailStepForm = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
  instructions: FormControl<string>;
  casualPrice: FormControl<number>;
  totalPointsMin: FormControl<number>;
  totalPointsMax: FormControl<number>;
  default: FormControl<boolean>;
  assignedTeacherId: FormControl<string>;
  defaultExam: FormControl<boolean>;
}>;

export type QuestionStepForm = FormGroup<{
  questionName: FormControl<string>;
  writtenPrompt: FormControl<string>; // a short description of the question task
  time: FormControl<number | null>; // question time limit (seconds)
  type: FormControl<string>;
  totalPointsMin: FormControl<number>; // smallest amount of points rewarded for question/section
  totalPointsMax: FormControl<number>; // total amount of points rewarded for question/section
  prompt1: FormControl<string | null>; // a prompt (image/audi/video) for the question
  prompt1Type: FormControl<string | null>; // a prompt type for the prompt above
  prompt2: FormControl<string | null>; // a second prompt for the question
  prompt2Type: FormControl<string | null>; // a second prompt type for the question
  prompt3: FormControl<string | null>; // a second prompt for the question
  prompt3Type: FormControl<string | null>; // a second prompt type for the question
  teacherFeedback: FormControl<boolean>; // true = teacher has to give feedback
  autoMarking: FormControl<boolean>; // false = teacher has to assign mark
  length: FormControl<number | null>; // word limit for written questions and time limit (seconds) for audio questions
  answers?: FormControl<{ question: string; correct: boolean }[] | null>; // used for multiple choice questions
}>;
