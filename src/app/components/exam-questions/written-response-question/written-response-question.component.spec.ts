import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ErrorMessageModule } from '../../error-message/error-message.module';
import { WrittenResponseQuestionComponent } from './written-response-question.component';

describe('WrittenResponseQuestionComponent', () => {
  let component: WrittenResponseQuestionComponent;
  let fixture: ComponentFixture<WrittenResponseQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WrittenResponseQuestionComponent],
      imports: [
        HttpClientTestingModule,
        MatFormFieldModule,
        ErrorMessageModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WrittenResponseQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
