import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { screenSizeBreakpoints } from 'src/app/shared/config';
import { LessonDTO, LessonTypeDTO } from 'src/app/shared/models/lesson.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-lesson-card',
  templateUrl: './lesson-card.component.html',
  styleUrls: ['./lesson-card.component.scss'],
})
export class LessonCardComponent implements OnChanges {
  @Input() lessonTypeFilter: LessonTypeDTO | undefined;
  @Input() lesson: LessonDTO | undefined;
  @Input() users?: UserDTO[] | null;
  @Input() pageName: string;
  @Output() deleteLesson = new EventEmitter<LessonDTO>();
  @Output() joinLesson = new EventEmitter<LessonDTO>();
  @Output() cancelLesson = new EventEmitter<LessonDTO>();

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
  currentUser = JSON.parse(localStorage.getItem('auth_data_token')!) as
    | { user: UserDTO }
    | undefined;

  constructor(public readonly authStoreService: AuthStoreService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('users' in changes) {
      this.getTeacherDetails();
    }
  }

  getLevels(): string {
    if (this.lesson) {
      const levelNames = this.lesson.level.map((level) => level.longName);
      return `${levelNames.join(', ')}`;
    } else {
      return '';
    }
  }

  getTeacherDetails(): void {
    if (this.users && this.lesson) {
      this.teacher = this.users.filter(
        (obj) => obj.email === this.lesson?.teacher
      )[0];
    }
  }

  filterLessonLevel(lesson: LessonDTO): boolean {
    if (
      this.currentUser?.user === undefined ||
      this.currentUser.user.level === null ||
      this.currentUser.user.userType.toLocaleLowerCase() === 'teacher' ||
      (this.currentUser.user.level &&
        lesson.level
          .map((level) => level.longName)
          .includes(this.currentUser.user.level.longName))
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
      this.currentUser?.user.email === this.teacher?.email
    ) {
      return true; // if we're on the 'my classes' page and the class belongs to the current logged in teacher
    } else if (
      this.pageName === 'lessons' &&
      this.currentUser?.user &&
      lesson.studentsEnrolled.includes(this.currentUser.user.email)
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
      this.currentUser.user.userType.toLowerCase() === 'student' &&
      !lesson.studentsEnrolled.includes(this.currentUser.user.email)
    ) {
      return true; // if the current user is a student and they're not enrolled in the lesson.
    } else {
      return false; // if the current user is a teacher or a student who is already enrolled in the lesson, hide the 'join' button.
    }
  }

  showLeaveButton(lesson: LessonDTO): boolean {
    if (
      this.currentUser?.user.userType.toLowerCase() === 'student' &&
      lesson.studentsEnrolled.includes(this.currentUser.user.email)
    ) {
      return true;
    } else {
      return false;
    }
  }

  deleteLessonClick(): void {
    this.deleteLesson.emit(this.lesson);
  }

  joinLessonClick(): void {
    this.joinLesson.emit(this.lesson);
  }

  cancelLessonClick(): void {
    this.cancelLesson.emit(this.lesson);
  }
}
