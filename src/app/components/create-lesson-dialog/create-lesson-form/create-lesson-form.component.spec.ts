import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CronEditorModule } from 'ngx-cron-editor';

import { ErrorMessageModule } from '../../error-message/error-message.module';
import { CreateLessonFormComponent } from './create-lesson-form.component';

describe('CreateLessonFormComponent', () => {
  let component: CreateLessonFormComponent;
  let fixture: ComponentFixture<CreateLessonFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateLessonFormComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        CronEditorModule,
        ErrorMessageModule,
        MatOptionModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateLessonFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
