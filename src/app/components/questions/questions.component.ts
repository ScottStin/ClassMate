import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserDTO } from 'src/app/shared/models/user.model';

import { QuestionList } from '../create-exam-dialog/create-exam-dialog.component';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
})
export class QuestionsComponent {
  @Input() question: QuestionList | null;
  @Input() displayMode: boolean;
  @Input() student: string;
  @Input() markMode: boolean;
  @Input() currentUser: UserDTO | null;
  @Output() updateStudentResponse = new EventEmitter<string>();

  onResponseChange(text: string): void {
    this.updateStudentResponse.emit(text);
  }
}
