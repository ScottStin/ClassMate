import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HomeworkFeedbackDialogComponent } from 'src/app/components/homework-feedback-dialog/homework-feedback-dialog.component';
import { CommentDTO, HomeworkDTO } from 'src/app/shared/models/homework.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-homework-card',
  templateUrl: './homework-card.component.html',
  styleUrls: ['./homework-card.component.scss'],
})
export class HomeworkCardComponent implements OnInit, OnChanges {
  @Input() selectedStudent: UserDTO | null;
  @Input() homework?: HomeworkDTO[] | null;
  @Input() users: UserDTO[] | null;
  @Input() currentUser: UserDTO | null;
  @Output() saveFeedback = new EventEmitter<{
    feedback: CommentDTO;
    homeworkId: string;
  }>();

  homeworkList: HomeworkDTO[] = [];

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.getHomeworkList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('selectedStudent' in changes) {
      this.getHomeworkList();
    }
  }

  getHomeworkList(): void {
    if (this.homework && this.selectedStudent?._id !== null) {
      this.homeworkList = this.homework.filter((obj) =>
        obj.students.includes(this.selectedStudent?._id ?? '')
      );
    }
  }

  downloadAttachment(attachmentUrl: string | undefined): void {
    if (attachmentUrl !== undefined) {
      const anchor = document.createElement('a');
      anchor.href = attachmentUrl;
      anchor.download = attachmentUrl;
      anchor.click();
    }
  }

  openAddFeedbackDialog(selectedHomework: HomeworkDTO | undefined): void {
    const teachers = this.users?.filter(
      (obj) => obj.userType.toLowerCase() === 'teacher'
    );
    const dialogRef = this.dialog.open(HomeworkFeedbackDialogComponent, {
      data: {
        title: `Upload feedback for ${
          this.selectedStudent?.name ?? 'this student'
        } on their ${selectedHomework?.name ?? 'homework'} submission`,
        teachers,
        commentType: 'feedback',
        selectedStudent: this.selectedStudent,
        currentUser: this.currentUser,
      },
    });
    dialogRef.afterClosed().subscribe((result: CommentDTO | null) => {
      if (result) {
        this.saveFeedback.emit({
          feedback: result,
          homeworkId: selectedHomework?._id ?? '',
        });
      }
    });
  }

  openAddSubmissionDialog(selectedHomework: HomeworkDTO | undefined): void {
    const dialogRef = this.dialog.open(HomeworkFeedbackDialogComponent, {
      data: {
        title: `Submit homework for ${selectedHomework?.name ?? 'homework'}`,
        commentType: 'submission',
        selectedStudent: this.currentUser,
      },
    });
    dialogRef.afterClosed().subscribe((result: CommentDTO | null) => {
      if (result) {
        this.saveFeedback.emit({
          feedback: result,
          homeworkId: selectedHomework?._id ?? '',
        });
      }
    });
  }

  getUserName(userId: string): string | null {
    // TODO = replace with service or directive
    const foundUser = this.users?.find((obj) => obj._id === userId);
    if (foundUser) {
      return foundUser.name;
    } else {
      return null;
    }
  }

  getAttemptCount(
    homeworkItem: HomeworkDTO | undefined,
    comment: CommentDTO
  ): number | undefined {
    if (homeworkItem) {
      return (
        (homeworkItem.comments
          ?.filter(
            (obj: CommentDTO | undefined) => obj?.commentType === 'submission'
          )
          .indexOf(comment) ?? 0) + 1
      );
    } else {
      return undefined;
    }
  }
}
