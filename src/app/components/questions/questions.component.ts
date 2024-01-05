import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserDTO } from 'src/app/shared/models/user.model';

import { QuestionList } from '../create-exam-dialog/create-exam-dialog.component';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
})
export class QuestionsComponent implements OnInit {
  @Input() question: QuestionList | null;
  @Input() displayMode: boolean;
  @Output() response = new EventEmitter<string>();

  currentUser = JSON.parse(localStorage.getItem('auth_data_token')!) as
    | { user: UserDTO }
    | undefined;

  // constructor() {}

  ngOnInit(): void {
    console.log(this.question);
  }

  updateResponse(text: string): void {
    this.response.emit(text);
  }
}
