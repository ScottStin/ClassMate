import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { FileService } from 'src/app/services/file-service/file.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { CommentDTO, HomeworkDTO } from 'src/app/shared/models/homework.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { CreateHomeworkDialogComponent } from '../create-homework-dialog/create-homework-dialog.component';

@Component({
  selector: 'app-homework-feedback-dialog',
  templateUrl: './homework-feedback-dialog.component.html',
  styleUrls: ['./homework-feedback-dialog.component.css'],
})
export class HomeworkFeedbackDialogComponent implements OnInit {
  feedbackForm: FormGroup<{
    text: FormControl<string>;
    pass: FormControl<boolean>;
    assignedTeacherId: FormControl<string>;
    duration: FormControl<number | null>;
    attachment: FormControl<{ url: string; fileName: string } | null>;
  }>;
  formPopulated = new Subject<boolean>();

  fileChangedEvent: Event | string = '';
  fileLink: string | null | undefined;
  fileName: string;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      body: CommentDTO | undefined;
      homeworkItem: HomeworkDTO;
      teachers?: UserDTO[];
      commentType: 'feedback' | 'submission';
      selectedStudent: UserDTO;
      lastSubmission?: boolean;
      currentUser: UserDTO | null;
    },
    public dialogRef: MatDialogRef<CreateHomeworkDialogComponent>,
    private readonly snackbarService: SnackbarService,
    readonly fileService: FileService
  ) {}

  ngOnInit(): void {
    this.populateForm();
  }

  populateForm(): void {
    const maxTextLength = 100;
    this.feedbackForm = new FormGroup({
      text: new FormControl(this.data.body?.text ?? '', {
        validators: [Validators.required, Validators.maxLength(maxTextLength)],
        nonNullable: true,
      }),
      duration: new FormControl(this.data.body?.duration ?? null, {
        validators: [],
        nonNullable: true,
      }),
      pass: new FormControl(
        this.data.lastSubmission !== undefined
          ? this.data.lastSubmission
          : this.data.body?.pass !== undefined
          ? this.data.body.pass
          : false,
        {
          validators: [],
          nonNullable: true,
        }
      ),
      assignedTeacherId: new FormControl('', {
        validators: [],
        nonNullable: true,
      }),
      attachment: new FormControl(this.data.body?.attachment ?? null, {
        validators: [],
        nonNullable: false,
      }),
    });
    this.formPopulated.next(true);
  }

  async fileChangeEvent(event: Event): Promise<void> {
    this.fileChangedEvent = event;
    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];
    if (!file || !this.fileService.validateFile(file, 'doc', 1000 * 1024)) {
      return;
    }

    this.fileName = file.name;

    try {
      this.fileLink = await this.fileService.convertToBase64(file);
    } catch (error) {
      this.snackbarService.queueBar(
        'error',
        'Error reading file. Please try again.'
      );
    }
  }

  closeDialog(save?: boolean): void {
    if (save === false || save === undefined) {
      this.dialogRef.close();
    } else {
      const feedbackForm = this.feedbackForm.getRawValue();

      // --- get attachment:
      let attachment = null;
      if (this.fileName && this.fileLink !== null && this.fileLink !== '') {
        attachment = { url: this.fileLink, fileName: this.fileName };
      }

      // --- set teacher:
      let teacher: string | null | undefined;
      if (this.data.currentUser?.userType.toLowerCase() === 'teacher') {
        teacher = this.data.currentUser._id;
      }
      if (this.data.currentUser?.userType.toLowerCase() === 'school') {
        teacher = feedbackForm.assignedTeacherId;
      }

      // --- save feedback:
      const feedback: CommentDTO = {
        text: feedbackForm.text,
        duration: feedbackForm.duration ?? undefined,
        commentType: this.data.commentType,
        pass: feedbackForm.pass,
        teacherId: teacher ?? this.data.homeworkItem.assignedTeacherId,
        attachment: attachment as { url: string; fileName: string },
        studentId: this.data.selectedStudent._id,
      };

      this.dialogRef.close(feedback);
    }
  }
}
