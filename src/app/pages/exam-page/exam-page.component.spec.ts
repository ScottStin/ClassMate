import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Socket } from 'ngx-socket-io';
import { CreateExamDialogModule } from 'src/app/components/create-exam-dialog/create-exam-dialog.module';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';
import { ExamTableModule } from 'src/app/pages/exam-page/exam-table/exam-table.module';
import { ShowExamDialogModule } from 'src/app/pages/exam-page/show-exam-dialog/show-exam-dialog.module';

import { ExamPageComponent } from './exam-page.component';

const socketMock = {
  on: jasmine.createSpy('on'),
  off: jasmine.createSpy('off'),
};

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
      providers: [{ provide: Socket, useValue: socketMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
