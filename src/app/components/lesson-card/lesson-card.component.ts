import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { screenSizeBreakpoints } from 'src/app/shared/config';
import { LessonDTO, LessonTypeDTO } from 'src/app/shared/models/lesson.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-lesson-card',
  templateUrl: './lesson-card.component.html',
  styleUrls: ['./lesson-card.component.scss'],
})
export class LessonCardComponent implements OnInit, OnChanges {
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

  ngOnInit(): void {
    console.log(this.pageName);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('users' in changes) {
      this.getTeacherDetails();
    }
  }

  getLevels(): string {
    if (this.lesson) {
      return `${this.lesson.level.join(', ')}`;
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

  getTimes(): string {
    if (this.lesson) {
      const inputDate = new Date(this.lesson.startTime);
      const day = inputDate.toLocaleDateString('en-US', {
        weekday: this.largeScreen ? 'short' : 'long',
      });
      const date = inputDate.getDate();
      const month = inputDate.toLocaleDateString('en-US', {
        month: this.largeScreen ? 'short' : 'long',
      });
      const year = inputDate.getFullYear();
      const hours = inputDate.getHours();
      const minutes = inputDate.getMinutes();
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      const amPm = hours >= 12 ? 'PM' : 'AM';
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const formattedDate = `${day} ${date} ${month} ${year} ${formattedHours}:${formattedMinutes} ${amPm}`;

      return formattedDate;
    } else {
      return '';
    }
  }

  deleteLessonClick(): void {
    this.deleteLesson.emit(this.lesson);
  }

  joinLessonClick(): void {
    this.joinLesson.emit(this.lesson);
  }
}
