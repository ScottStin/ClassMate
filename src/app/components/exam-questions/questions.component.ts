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
import { readOutloudQuestionPrompt } from 'src/app/services/question-service/question.service';
import { CreateExamQuestionDto } from 'src/app/shared/models/question.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
})
export class QuestionsComponent implements OnChanges {
  @ViewChild('audioRef', { static: false }) audioElement?: ElementRef;

  @Input() question?: CreateExamQuestionDto;
  @Input() displayMode: boolean;
  @Input() studentId?: string;
  @Input() markMode: boolean;
  @Input() currentUser?: UserDTO;

  @Output() updateStudentResponse = new EventEmitter<string>();

  readOutloudQuestionPrompt = readOutloudQuestionPrompt;

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
