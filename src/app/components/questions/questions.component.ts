import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserDTO } from 'src/app/shared/models/user.model';

import { QuestionList } from '../create-exam-dialog/create-exam-dialog.component';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
})
export class QuestionsComponent implements OnInit, OnChanges {
  @Input() question: QuestionList | null;
  @Input() displayMode: boolean;
  @Input() student: string;
  @Input() markMode: boolean;
  @Input() currentUser: UserDTO | null;
  @Output() response = new EventEmitter<string>();
  @Output() feedback = new EventEmitter<{
    feedback: string;
    mark: string;
    student: string;
  }>();

  feedbackForm: FormGroup<{
    teacherFeedback: FormControl<string>;
    mark: FormControl<string | number>;
  }>;

  formPopulated = new Subject<boolean>();

  constructor(private readonly snackbarService: SnackbarService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('question' in changes) {
      this.populateFeedbackForm();
    }
  }

  ngOnInit(): void {
    this.populateFeedbackForm();
  }

  populateFeedbackForm(): void {
    const studentResponse = this.question?.studentResponse?.find(
      (obj) => obj.student === this.student
    );
    this.feedbackForm = new FormGroup({
      teacherFeedback: new FormControl(
        {
          value: studentResponse?.feedback?.text ?? '',
          disabled: this.currentUser?.userType.toLowerCase() === 'student',
        },
        { validators: [Validators.required], nonNullable: true }
      ),
      mark: new FormControl(
        {
          value: studentResponse?.mark ?? '',
          disabled: this.currentUser?.userType.toLowerCase() === 'student',
        },
        { validators: [Validators.required], nonNullable: true }
      ),
    });
    this.formPopulated.next(true);
  }

  saveFeedback(feedback: string, mark: string): void {
    this.feedback.emit({ feedback, mark, student: this.student });
  }

  updateResponse(text: string): void {
    this.response.emit(text);
  }
}
