import {
  Component,
  HostListener,
  Input,
  OnChanges,
  OnInit,
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
export class LessonCardComponent implements OnChanges {
  @Input() lessonTypeFilter: LessonTypeDTO | undefined;
  @Input() lesson!: LessonDTO;
  @Input() users?: UserDTO[] | null;
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.mediumScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.medium, 10);
    this.showPhoto = !this.mediumScreen;
  }

  teacher: UserDTO | undefined;
  showPhoto = true;
  mediumScreen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if ('users' in changes) {
      this.getTeacherDetails();
    }
  }

  getLevels(): string {
    let string = 'Level';
    if (this.lesson.level.length > 1) {
      string = 'Levels';
    }
    return `${string}: ${this.lesson.level.join(', ')}`;
  }

  getTeacherDetails(): void {
    if (this.users) {
      this.teacher = this.users.filter(
        (obj) => obj.email === this.lesson.teacher
      )[0];
    }
    console.log(this.teacher);
  }

  getTimes(): string {
    const inputDate = new Date(this.lesson.startTime);
    const day = inputDate.toLocaleDateString('en-US', { weekday: 'long' });
    const date = inputDate.getDate();
    const month = inputDate.toLocaleDateString('en-US', { month: 'long' });
    const year = inputDate.getFullYear();
    const hours = inputDate.getHours();
    const minutes = inputDate.getMinutes();
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedDate = `${day} ${date} ${month} ${year} ${formattedHours}:${formattedMinutes} ${amPm}`;

    return formattedDate;
  }
}
