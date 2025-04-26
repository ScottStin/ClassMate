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
import { CreateExamQuestionDto } from 'src/app/shared/models/question.model';

@Component({
  selector: 'app-multi-choice-question',
  templateUrl: './multi-choice-question.component.html',
  styleUrls: ['./multi-choice-question.component.css'],
})
export class MultiChoiceQuestionComponent implements OnInit, OnChanges {
  @Input() question: CreateExamQuestionDto | null;
  @Input() disableForms: boolean;
  @Input() markMode: boolean;
  @Input() displayMode: boolean;
  @Input() currentUserId: string | undefined;
  @Output() responseChange = new EventEmitter<string>();

  questionForm: FormGroup<{
    selectedOptionId: FormControl<string>;
  }>;
  loading = true;

  ngOnChanges(changes: SimpleChanges): void {
    if ('question' in changes && this.question) {
      this.populateQuestionForm();
    }
  }

  ngOnInit(): void {
    this.populateQuestionForm();
  }

  populateQuestionForm(): void {
    if (!this.question) {
      return;
    }

    const studentResponse = this.question.studentResponse?.find(
      (obj) => obj.studentId === this.currentUserId
    );
    this.questionForm = new FormGroup({
      selectedOptionId: new FormControl(
        {
          value: studentResponse?.response ?? '',
          disabled: this.disableForms,
        },
        {
          validators: [Validators.required],
          nonNullable: true,
        }
      ),
    });
    this.loading = false;
  }

  onAnswerSelect(answer: string): void {
    this.responseChange.emit(answer);
  }
}
