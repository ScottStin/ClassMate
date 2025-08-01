import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Socket } from 'ngx-socket-io';
import { HeaderCardModule } from 'src/app/components/header-card/header-card.module';
import { LessonCardModule } from 'src/app/pages/lesson-page/lesson-card/lesson-card.module';
import { UserCardModule } from 'src/app/pages/user-page/user-card/user-card.module';
import { UserTableModule } from 'src/app/pages/user-page/user-table/user-table.module';

import { TeacherPageComponent } from './teacher-page.component';

describe('TeacherPageComponent', () => {
  let component: TeacherPageComponent;
  let fixture: ComponentFixture<TeacherPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeacherPageComponent],
      imports: [
        MatProgressBarModule,
        MatTabsModule,
        HeaderCardModule,
        LessonCardModule,
        UserCardModule,
        UserTableModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule,
        BrowserAnimationsModule,
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

    fixture = TestBed.createComponent(TeacherPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
