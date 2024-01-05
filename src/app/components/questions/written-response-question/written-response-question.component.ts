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

import { QuestionList } from '../../create-exam-dialog/create-exam-dialog.component';

@Component({
  selector: 'app-written-response-question',
  templateUrl: './written-response-question.component.html',
  styleUrls: ['./written-response-question.component.css'],
})
export class WrittenResponseQuestionComponent implements OnInit, OnChanges {
  @Input() question: QuestionList | null;
  @Input() disableForms: boolean;
  @Input() currentUser: string | undefined;
  @Output() response = new EventEmitter<string>();
  wordCount: number;
  loading = true;

  questionForm: FormGroup<{
    writtenResponse: FormControl<string>;
  }>;

  ngOnChanges(changes: SimpleChanges): void {
    if ('question' in changes) {
      this.populateQuestionForm();
    }
  }

  // constructor() {}

  formPopulated = new Subject<boolean>();

  ngOnInit(): void {
    this.populateQuestionForm();
  }

  populateQuestionForm(): void {
    const studentResponse = this.question?.studentResponse?.find(
      (obj) => obj.student === this.currentUser
    );
    this.questionForm = new FormGroup({
      writtenResponse: new FormControl(
        {
          value: studentResponse?.response ?? '',
          disabled: this.disableForms,
        },
        {
          validators: [
            Validators.required,
            Validators.maxLength(this.question?.length ?? 10),
          ],
          nonNullable: true,
        }
      ),
    });
    this.loading = false;
    this.formPopulated.next(true);
  }

  wordCounter(text: string): void {
    this.response.emit(text);
    this.wordCount = text.split(/\s+/u).length;
  }
}
