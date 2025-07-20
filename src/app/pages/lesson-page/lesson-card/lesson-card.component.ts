import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LessonFormValue } from 'src/app/components/create-lesson-dialog/create-lesson-form/create-lesson-form.component';
import { EditLessonDialogComponent } from 'src/app/components/edit-lesson-dialog/edit-lesson-dialog.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { screenSizeBreakpoints } from 'src/app/shared/config';
import { LessonDTO, LessonTypeDTO } from 'src/app/shared/models/lesson.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { AddStudentToLessonDialogComponent } from '../../../components/add-student-to-lesson-dialog/add-student-to-lesson-dialog.component';
import { StudentsEnrolledLessonDialogComponent } from '../../../components/students-enrolled-lesson-dialog/students-enrolled-lesson-dialog.component';

@Component({
  selector: 'app-lesson-card',
  templateUrl: './lesson-card.component.html',
  styleUrls: ['./lesson-card.component.scss'],
})
export class LessonCardComponent implements OnChanges {
  @Input() lessonTypeFilter: LessonTypeDTO | undefined;
  @Input() lesson: LessonDTO | undefined;
  @Input() users: UserDTO[] | null;
  @Input() teachers: UserDTO[] | null;
  @Input() currentUser: UserDTO | null;
  @Input() currentSchool: SchoolDTO | null;
  @Input() pastLesson?: boolean | undefined;
  @Input() pageName: string;
  @Output() deleteLesson = new EventEmitter<LessonDTO>();
  @Output() joinLesson = new EventEmitter<LessonDTO>();
  @Output() cancelLesson = new EventEmitter<LessonDTO>();
  @Output() editLesson = new EventEmitter<LessonDTO>();
  @Output() refreshLessons = new EventEmitter();
  @Output() startLesson = new EventEmitter<LessonDTO>();
  @Output() enterLesson = new EventEmitter<string>();

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.mediumScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.medium, 10);
    this.showPhoto = !this.mediumScreen;
    this.largeScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.large, 10);
  }

  teacher: UserDTO | undefined;
  showPhoto = true;
  mediumScreen = false;
  largeScreen = false;
  profilePictureSrc =
    'https://www.pngfind.com/pngs/m/610-6104451_image-placeholder-png-user-profile-placeholder-image-png.png';

  constructor(
    public readonly authStoreService: AuthStoreService,
    public dialog: MatDialog,
    private readonly snackbarService: SnackbarService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('users' in changes) {
      this.getTeacherDetails();
    }
  }

  getLevels(): string {
    if (this.lesson) {
      const levelNames = this.lesson.level.map((level) => level.shortName);
      return `${levelNames.join(', ')}`;
    } else {
      return '';
    }
  }

  getTeacherDetails(): void {
    if (this.users && this.lesson) {
      this.teacher = this.users.filter(
        (obj) => obj._id === this.lesson?.teacherId
      )[0];
    }
  }

  filterLessonLevel(lesson: LessonDTO): boolean {
    if (
      this.currentUser === null ||
      this.currentUser.level === null ||
      this.currentUser.level === undefined ||
      this.currentUser.userType.toLocaleLowerCase() === 'teacher' ||
      this.currentUser.userType.toLowerCase() === 'school' ||
      // (this.currentUser.user.level &&
      lesson.level
        .map((level) => level.longName)
        .includes(this.currentUser.level.longName)
    ) {
      return true; // if the lesson matches the current user's level, or there's no current user, or the current user is a teacher or doesn't have a level, show the lesson
    } else {
      return false; // if the lesson does not match the current user's level, hide the lesson
    }
  }

  filterLessonUsers(lesson: LessonDTO): boolean {
    if (
      (this.lessonTypeFilter?.name === lesson.type.name ||
        !this.lessonTypeFilter) &&
      this.pageName !== 'lessons'
    ) {
      return this.filterLessonLevel(lesson); // If we're on the home page and the lesson type matches the type filter, show the lesson
    } else if (
      this.pageName === 'lessons' &&
      (this.currentUser?._id === this.teacher?._id ||
        this.currentUser?.userType === 'school')
    ) {
      return true; // if we're on the 'my classes' page and the class belongs to the current logged in teacher
    } else if (
      this.pageName === 'lessons' &&
      this.currentUser &&
      lesson.studentsEnrolledIds.includes(this.currentUser._id)
    ) {
      return true; // if we're on the 'my classes' page and the current enrolled student is a enrolled in that class
    } else {
      return false; // hide the lesson from display
    }
  }

  showJoinButton(lesson: LessonDTO): boolean {
    if (!this.currentUser) {
      return true; // if there's not current user.
    } else if (
      this.currentUser.userType.toLowerCase() === 'student' &&
      !lesson.studentsEnrolledIds.includes(this.currentUser._id)
    ) {
      return true; // if the current user is a student and they're not enrolled in the lesson.
    } else {
      return false; // if the current user is a teacher or a student who is already enrolled in the lesson, hide the 'join' button.
    }
  }

  showLeaveButton(lesson: LessonDTO): boolean {
    if (
      this.currentUser?.userType.toLowerCase() === 'student' &&
      lesson.studentsEnrolledIds.includes(this.currentUser._id)
    ) {
      return true;
    } else {
      return false;
    }
  }

  showStartButton(lesson: LessonDTO): boolean {
    const startTime = new Date(lesson.startTime);
    const fiveMinutesBefore = new Date(startTime.getTime() - 10 * 60 * 1000);
    const currentTime = new Date();
    return currentTime >= fiveMinutesBefore; // && currentTime < startTime;
  }

  startLessonClick(lesson: LessonDTO): void {
    this.startLesson.emit(lesson);
  }

  enterLessonClick(lessonId: string | undefined): void {
    if (lessonId !== undefined) {
      this.enterLesson.emit(lessonId);
    }
  }

  openAddStudentDialog(lesson: LessonDTO): void {
    const filteredStudents = this.users?.filter((obj) => {
      if (obj.level) {
        return lesson.level
          .map((level) => level.shortName)
          .includes(obj.level.shortName);
      } else {
        return false;
      }
    });
    const addStudentToLessonDialogRef = this.dialog.open(
      AddStudentToLessonDialogComponent,
      {
        data: { lesson, filteredStudents, users: this.users },
      }
    );
    addStudentToLessonDialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.refreshLessons.emit();
      }
    });
  }

  openStudentsEnrolledDialog(lesson: LessonDTO): void {
    const studentsEnrolledDialogRef = this.dialog.open(
      StudentsEnrolledLessonDialogComponent,
      {
        data: { lesson, pastLesson: this.pastLesson, users: this.users },
      }
    );
    studentsEnrolledDialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.refreshLessons.emit();
      }
    });
  }

  deleteLessonClick(): void {
    this.deleteLesson.emit(this.lesson);
  }

  joinLessonClick(): void {
    this.joinLesson.emit(this.lesson);
  }

  editLessonClick(): void {
    if (!this.lesson) {
      this.snackbarService.queueBar('error', 'Lesson not found.');
      return;
    }

    const dialogRef = this.dialog.open(EditLessonDialogComponent, {
      data: {
        title: `Edit lesson: ${this.lesson.name}`,
        lesson: this.lesson,
        currentUser: this.currentUser,
        teachers: this.teachers,
        lessonTypes: this.currentSchool?.lessonTypes ?? [],
      },
    });
    dialogRef.afterClosed().subscribe((formValue?: LessonFormValue) => {
      if (formValue) {
        if (!formValue.typeInput) {
          this.snackbarService.queueBar(
            'error',
            `Failed to update lesson: form incomplete`
          );
          return;
        }

        const updatedLesson: LessonDTO = {
          _id: this.lesson?._id ?? '',
          teacherId:
            this.currentUser?.userType.toLowerCase() !== 'school'
              ? this.currentUser?._id ?? ''
              : formValue.assignedTeacherId,
          startTime: formValue.dateInput ?? new Date().toString(),
          maxStudents: formValue.sizeInput,
          type: formValue.typeInput,
          schoolId: this.currentSchool?._id ?? '',
          level: formValue.levelInput,
          name: formValue.nameInput,
          duration: formValue.lengthInput,
          description: formValue.descriptionInput,
          studentsEnrolledIds: this.lesson?.studentsEnrolledIds ?? [],
          disableFirtsLesson: false,
          casualPrice: 0,
        }; // TODO - move this logic to CreateLessonForm to avoid repeating in update and edit lesson functionality

        this.editLesson.emit(updatedLesson);
      }
    });
  }

  cancelLessonClick(): void {
    this.cancelLesson.emit(this.lesson);
  }
}
