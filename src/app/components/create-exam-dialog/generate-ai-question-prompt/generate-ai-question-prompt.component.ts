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

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-generate-ai-question-prompt',
  templateUrl: './generate-ai-question-prompt.component.html',
  styleUrls: ['./generate-ai-question-prompt.component.css'],
})
export class GenerateAiQuestionPromptComponent implements OnInit {
  questionDisplay = '';
  eslTestTypes = eslTestTypes;
  accents = accents;
  audioPromptTypes = audioPromptTypes;
  writtenPromptTypes = writtenPromptTypes;
  isAudioPrompt = false;
  genders = ['Any', 'Male', 'Female'];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      isAudioPrompt?: boolean;
    },
    private readonly dialogRef: MatDialogRef<GenerateAiQuestionPromptComponent>,
    public dialog: MatDialog
  ) {
    // this.questionDisplay =
    //   questionTypes.find((question) => question.type === data.questionType)
    //     ?.label ?? '';

    // if (this.data.questionType === 'repeat-sentence') {
    //   this.isAudioPrompt = true;
    // }

    this.isAudioPrompt = this.data.isAudioPrompt ?? false;
  }

  promptForm: FormGroup<{
    length: FormControl<number>;
    audioPromptTypeSelect: FormControl<string>;
    examTypeSelect: FormControl<string>;
    accentSelect: FormControl<string>;
    genderSelect: FormControl<string>;
  }>;

  ngOnInit(): void {
    this.populateForm();
  }

  populateForm(): void {
    this.promptForm = new FormGroup({
      audioPromptTypeSelect: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      length: new FormControl(NaN, {
        validators: [this.lengthValidator()],
        nonNullable: true,
      }),
      examTypeSelect: new FormControl('General English', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      accentSelect: new FormControl('Neutral', {
        validators: [],
        nonNullable: true,
      }),
      genderSelect: new FormControl('Any', {
        validators: [],
        nonNullable: true,
      }),
    });

    if (this.isAudioPrompt) {
      this.promptForm.controls.accentSelect.setValidators(Validators.required);
      this.promptForm.controls.genderSelect.setValidators(Validators.required);
      this.promptForm.controls.length.setValue(1);
    } else {
      this.promptForm.controls.length.setValue(20);
    }
  }

  closeDialog(save?: boolean): void {
    if (!save) {
      if (!this.promptForm.dirty) {
        this.dialogRef.close();
        return;
      }

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Close Ai Prompt Form?',
          message: 'Changes will be unsaved. Are you sure?',
          okLabel: 'Close',
          cancelLabel: 'Cancel',
        },
      });
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.dialogRef.close();
        }
      });
    } else {
      if (!this.promptForm.valid) {
        return;
      }

      const promptForm = this.promptForm.getRawValue();

      let aiPrompt = `Generate a ${
        this.isAudioPrompt ? 'audio mp3' : 'written prompt'
      } for a ${promptForm.audioPromptTypeSelect} ESL exam question used in a ${
        promptForm.examTypeSelect
      } exam. `;

      if (this.isAudioPrompt) {
        aiPrompt += `Do NOT add any closing statements or opening statements, just the direct audio being requested. `;
        if (
          promptForm.audioPromptTypeSelect.toLowerCase() === 'repeat sentence'
        ) {
          aiPrompt += ` The audio prompt should be approx ${promptForm.length} sentence(s)`;
        } else {
          aiPrompt += ` The audio prompt should be approx ${promptForm.length} seconds in length`;
        }
        aiPrompt += ` The speaker should have a obvious ${promptForm.accentSelect} accent.`;
      } else {
        aiPrompt += ` The text prompt should be approx ${promptForm.length} word(s).`;
      }

      this.dialogRef.close({
        prompt: aiPrompt,
        isAudioPrompt: this.isAudioPrompt,
        accent: this.isAudioPrompt ? promptForm.accentSelect : undefined,
        gender: this.isAudioPrompt ? promptForm.genderSelect : undefined,
      });
    }
  }

  onAudioPromptTypeChange(): void {
    this.lengthValidator();
    this.promptForm.controls.length.updateValueAndValidity();
  }

  lengthValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const value = control.value as number;
      if (!value || typeof value !== 'number') {
        return { required: true };
      }

      if (
        this.isAudioPrompt &&
        this.promptForm.getRawValue().audioPromptTypeSelect.toLowerCase() ===
          'repeat sentence'
      ) {
        if (value < 1) {
          return { lessThanOne: true };
        }
        if (value > 5) {
          return { tooLong: true };
        }
      } else {
        if (value < 5) {
          return { tooShort: true };
        }
        if (value > 120) {
          return { tooLong: true };
        }
      }
      return null;
    };
  }
}

export const accents = [
  'Neutral',
  'Australian',
  'American',
  'Canadian',
  'English',
  'Irish',
  'New Zealand',
  'Scottish',
  'South African',
  'Welsh',
];

export const eslTestTypes = [
  'General English',
  'Level Test',
  'PTE',
  'IELTS',
  'Cambridge',
  'OET',
  'TOEFL',
];

export const audioPromptTypes = [
  'Summarise lecture',
  'Write from dictation',
  'Repeat sentence',
  'Answer general question about yourself',
];

export const writtenPromptTypes = [
  'Summarise written text',
  'Read aloud',
  'Essay topic',
  'Answer general question about yourself',
];
