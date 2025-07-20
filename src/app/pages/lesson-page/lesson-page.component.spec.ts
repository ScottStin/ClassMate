import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Socket } from 'ngx-socket-io';
import { ConfirmDialogModule } from 'src/app/components/confirm-dialog/confirm-dialog.module';
import { CreateLessonDialogModule } from 'src/app/components/create-lesson-dialog/create-lesson-dialog.module';
import { EditLessonDialogModule } from 'src/app/components/edit-lesson-dialog/edit-lesson-dialog.module';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';
import { LessonCardModule } from 'src/app/pages/lesson-page/lesson-card/lesson-card.module';

import { LessonPageComponent } from './lesson-page.component';

describe('LessonPageComponent', () => {
  let component: LessonPageComponent;
  let fixture: ComponentFixture<LessonPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LessonPageComponent],
      imports: [
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatTabsModule,
        ConfirmDialogModule,
        CreateLessonDialogModule,
        HeaderCardModule,
        LessonCardModule,
        MatSnackBarModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        EditLessonDialogModule,
      ],
      providers: [
        {
          provide: Socket,
          useValue: {
            on: jasmine.createSpy('on'),
            off: jasmine.createSpy('off'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LessonPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
