import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateExamDialogModule } from 'src/app/components/create-exam-dialog/create-exam-dialog.module';
import { ExamTableModule } from 'src/app/pages/exam-page/exam-table/exam-table.module';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';
import { ShowExamDialogModule } from 'src/app/components/show-exam-dialog/show-exam-dialog.module';

import { ExamPageComponent } from './exam-page.component';

describe('ExamPageComponent', () => {
  let component: ExamPageComponent;
  let fixture: ComponentFixture<ExamPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExamPageComponent],
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule,
        MatDialogModule,
        MatProgressBarModule,
        MatTabsModule,
        CreateExamDialogModule,
        ExamTableModule,
        HeaderCardModule,
        ShowExamDialogModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
