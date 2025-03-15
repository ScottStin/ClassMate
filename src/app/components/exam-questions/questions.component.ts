import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { UserDTO } from 'src/app/shared/models/user.model';

import { QuestionList } from '../create-exam-dialog/create-exam-dialog.component';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
})
export class QuestionsComponent implements OnChanges {
  @ViewChild('audioRef', { static: false }) audioElement?: ElementRef;

  @Input() question: QuestionList | null;
  @Input() displayMode: boolean;
  @Input() student: string;
  @Input() markMode: boolean;
  @Input() currentUser: UserDTO | null;

  @Output() updateStudentResponse = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (this.audioElement && 'question' in changes) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      this.audioElement.nativeElement.load(); // Reloads the audio source when question changes
    }
  }

  onResponseChange(text: string): void {
    this.updateStudentResponse.emit(text);
  }
}
