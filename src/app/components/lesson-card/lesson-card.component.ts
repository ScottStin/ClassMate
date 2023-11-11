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

  filterLessonType(lesson: LessonDTO): boolean {
    const user = JSON.parse(localStorage.getItem('auth_data_token')!) as {
          user: UserDTO;
        }
      | undefined; // todo - move to component level
    console.log(lesson.level);
    console.log(user?.user.level);
    if (
      user?.user === undefined ||
      user.user.level === null ||
      user.user.userType.toLocaleLowerCase() === 'teacher' ||
      (user.user.level &&
        lesson.level
          .map((level) => level.longName)
          .includes(user.user.level.longName))
    ) {
      return true;
    } else {
      return false;
    }
  }

  deleteLessonClick(): void {
    console.log('click');
    this.deleteLesson.emit(this.lesson);
  }

  joinLessonClick(): void {
    this.joinLesson.emit(this.lesson);
  }
}
