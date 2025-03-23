/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { QuestionService } from 'src/app/services/question-service/question.service';
import { CreateExamQuestionDto } from 'src/app/shared/models/question.model';

@Component({
  selector: 'app-written-response-question',
  templateUrl: './written-response-question.component.html',
  styleUrls: ['./written-response-question.component.css'],
})
export class WrittenResponseQuestionComponent implements OnInit, OnChanges {
  @Input() question: CreateExamQuestionDto | null;
  @Input() disableForms: boolean;
  @Input() currentUser: string | undefined;
  @Output() responseChange = new EventEmitter<string>();
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

  constructor(private readonly questionService: QuestionService) {}

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
            this.wordCountValidator(1, this.question?.length ?? 0),
          ],
          nonNullable: true,
        }
      ),
    });
    this.wordCounter(studentResponse?.response ?? '');
    this.loading = false;
    this.formPopulated.next(true);
  }

  wordCounter(text: string): void {
    this.responseChange.emit(text);
    this.wordCount = text.split(/\s+/u).length - 1;
  }

  // todo - move to service or helper
  wordCountValidator(minWords: number, maxWords: number): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      const value = control.value as string;
      const words = value ? value.trim().split(/\s+/u) : [];
      const wordCount = words.length;
      if (wordCount < minWords) {
        return { tooFewWords: true };
      }
      if (wordCount > maxWords) {
        return { tooManyWords: true };
      }
      return null;
    };
  }
}
