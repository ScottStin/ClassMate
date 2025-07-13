import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Socket } from 'ngx-socket-io';
import { FilterCardModule } from 'src/app/components/filter-card/filter-card.module';
import { SideNavModule } from 'src/app/components/side-nav/side-nav.module';

import { ExamPageModule } from '../exam-page/exam-page.module';
import { LessonPageModule } from '../lesson-page/lesson-page.module';
import { UserPageModule } from '../user-page/user-page.module';
import { MainPageComponent } from './main-page.component';

describe('MainPageComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MainPageComponent],
      imports: [
        MatSidenavModule,
        FilterCardModule,
        SideNavModule,
        ExamPageModule,
        LessonPageModule,
        UserPageModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        RouterTestingModule,
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

    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
