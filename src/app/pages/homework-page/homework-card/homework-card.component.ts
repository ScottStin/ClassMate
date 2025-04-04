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
  @Input() showUnfinishedHomeworkOnly: boolean;
  @Input() displayCloseButton: boolean | undefined;
  @Output() closeDialog = new EventEmitter();
  @Output() openDeleteCommentDialog = new EventEmitter<{
    homework: HomeworkDTO;
    comment: CommentDTO;
  }>();
  @Output() saveFeedback = new EventEmitter<{
    feedback: CommentDTO;
    homeworkId: string;
    update: boolean;
    schoolId: string;
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
    if ('homework' in changes) {
      this.getHomeworkList();
    }
  }

  filterResults(text: string): void {
    if (this.homework && this.selectedStudent) {
      this.homeworkList = this.homework
        .filter((obj) =>
          obj.students
            .map((student) => student.studentId)
            .includes(this.selectedStudent?._id ?? '')
        )
        .filter(
          (obj) =>
            obj.description.toLowerCase().includes(text.toLowerCase()) ||
            obj.name.toLowerCase().includes(text.toLowerCase()) ||
            obj.assignedTeacherId.toLowerCase().includes(text.toLowerCase())
        );
    }
  }

  getHomeworkList(): void {
    if (this.homework && this.selectedStudent) {
      this.homeworkList = this.homework.filter((obj) =>
        obj.students
          .map((student) => student.studentId)
          .includes(this.selectedStudent?._id ?? '')
      );
    }
  }

  homeworkCompleted(homework: HomeworkDTO): boolean {
    return (
      homework.students.find(
        (student) => student.studentId === this.selectedStudent?._id
      )?.completed ?? false
    );
  }

  downloadAttachment(attachmentUrl: string | undefined): void {
    if (attachmentUrl !== undefined) {
      const anchor = document.createElement('a');
      anchor.href = attachmentUrl;
      // anchor.download = attachmentUrl;
      anchor.target = '_blank';
      anchor.click();
    }
  }

  openAddFeedbackDialog(
    selectedHomework: HomeworkDTO | undefined,
    comment: CommentDTO | undefined
  ): void {
    const teachers = this.users?.filter(
      (obj) => obj.userType.toLowerCase() === 'teacher'
    );
    const dialogRef = this.dialog.open(HomeworkFeedbackDialogComponent, {
      data: {
        title: `Upload feedback for ${
          this.selectedStudent?.name ?? 'this student'
        } on their ${selectedHomework?.name ?? 'homework'} submission`,
        teachers,
        body: comment,
        homeworkItem: selectedHomework,
        commentType: 'feedback',
        selectedStudent: this.selectedStudent,
        currentUser: this.currentUser,
        lastSubmission:
          selectedHomework?.attempts !== null &&
          selectedHomework?.attempts !== undefined
            ? this.getAttemptCount(selectedHomework) >=
              selectedHomework.attempts
            : false,
      },
    });
    dialogRef.afterClosed().subscribe((result: CommentDTO | null) => {
      if (result) {
        this.saveFeedback.emit({
          feedback: result,
          homeworkId: selectedHomework?._id ?? '',
          update: comment !== undefined,
          schoolId: this.currentUser?.schoolId as string,
        });
      }
    });
  }

  openAddSubmissionDialog(
    selectedHomework: HomeworkDTO | undefined,
    submission: CommentDTO | undefined
  ): void {
    const dialogRef = this.dialog.open(HomeworkFeedbackDialogComponent, {
      data: {
        title: `Submit homework for ${selectedHomework?.name ?? 'homework'}`,
        commentType: 'submission',
        body: submission,
        homeworkItem: selectedHomework,
        selectedStudent: this.currentUser,
      },
    });
    dialogRef.afterClosed().subscribe((result: CommentDTO | null) => {
      if (result) {
        this.saveFeedback.emit({
          feedback: result,
          homeworkId: selectedHomework?._id ?? '',
          update: submission !== undefined,
          schoolId: this.currentUser?.schoolId as string,
        });
      }
    });
  }

  openDeleteCommentDialogClick(
    homework: HomeworkDTO | undefined,
    comment: CommentDTO | undefined
  ): void {
    if (homework && comment) {
      this.openDeleteCommentDialog.emit({ homework, comment });
    }
  }

  getUserName(userId: string): string | null {
    // TODO = replace with service or directive
    const foundUser = this.users?.find((user) => user._id === userId);
    if (foundUser) {
      return foundUser.name;
    } else {
      return null;
    }
  }

  getProfilePicture(userId?: string): string | undefined {
    // TODO = replace with service or directive
    const foundUser = this.users?.find((user) => user._id === userId);
    if (foundUser) {
      return foundUser.profilePicture?.url;
    } else {
      return undefined;
    }
  }

  overdueHomework(homeworkItem: HomeworkDTO): boolean {
    if (homeworkItem.dueDate === null) {
      return false;
    } else {
      const today = new Date();
      return new Date(homeworkItem.dueDate).getTime() < today.getTime();
    }
  }

  getCompletedHomeworkDuration(homeworkItem: HomeworkDTO): number {
    let duration = homeworkItem.duration;
    if (this.homeworkCompleted(homeworkItem)) {
      const comments = homeworkItem.comments?.filter(
        (comment) => comment.studentId === this.selectedStudent?._id
      );
      if (comments && comments.length > 0) {
        duration =
          comments[comments.length - 1].duration ?? homeworkItem.duration;
      }
    }
    return duration;
  }

  allowSubmission(homeworkItem: HomeworkDTO): boolean {
    let allow = true;

    // --- hide submit button for students if the last comment was a submission:
    if (homeworkItem.comments && homeworkItem.comments.length > 0) {
      const commentLength = homeworkItem.comments.length;
      if (
        this.currentUser?.userType.toLowerCase() === 'student' &&
        homeworkItem.comments[commentLength - 1]?.commentType === 'submission'
      ) {
        allow = false;
      }

      // --- hide submit button for students if they have exceeded the max number of submissions:
      if (
        homeworkItem.attempts !== null &&
        homeworkItem.attempts !== undefined &&
        this.getAttemptCount(homeworkItem) >= homeworkItem.attempts &&
        this.currentUser?.userType.toLowerCase() === 'student'
      ) {
        allow = false;
      }

      // --- hide submit button for students and teacher if the homework is completed:
      const studentResult = homeworkItem.students.find(
        (student) => student.studentId === this.selectedStudent?._id
      );
      if (studentResult?.completed === true) {
        allow = false;
      }
    }
    return allow;
  }

  isMarkPending(
    studentId: string | null | undefined,
    homeworkItems: HomeworkDTO | null
  ): boolean {
    const studentComments = homeworkItems?.comments?.filter(
      (comment) => comment.studentId === studentId
    );
    const commentLength = studentComments?.length;
    if (
      studentComments &&
      studentComments.length > 0 &&
      commentLength !== undefined &&
      studentComments[commentLength - 1].commentType === 'submission'
    ) {
      return true;
    } else {
      return false;
    }
  }

  getAttemptCount(homeworkItem: HomeworkDTO): number {
    return (
      homeworkItem.comments?.filter(
        (comment) =>
          comment.studentId === this.selectedStudent?._id &&
          comment.commentType === 'submission'
      ).length ?? 0
    );
  }

  getAttemptIndex(
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

  // if homework card is opened as a dialog, this will emit a close message:
  closeDialogClick(): void {
    this.closeDialog.emit();
  }
}
