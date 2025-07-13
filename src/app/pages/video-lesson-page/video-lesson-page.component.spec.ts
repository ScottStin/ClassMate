import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Socket } from 'ngx-socket-io';

import { VideoLessonPageComponent } from './video-lesson-page.component';
import { VideoLessonPageRoutingModule } from './video-lesson-page-routing.module';
import { VideoLessonViewModule } from './video-lesson-view/video-lesson-view.module';

const socketMock = {
  on: jasmine.createSpy('on'),
  off: jasmine.createSpy('off'),
};

describe('VideoLessonPageComponent', () => {
  let component: VideoLessonPageComponent;
  let fixture: ComponentFixture<VideoLessonPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VideoLessonPageComponent],
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        VideoLessonPageRoutingModule,
        VideoLessonViewModule,
        HttpClientTestingModule,
      ],
      providers: [{ provide: Socket, useValue: socketMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoLessonPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
