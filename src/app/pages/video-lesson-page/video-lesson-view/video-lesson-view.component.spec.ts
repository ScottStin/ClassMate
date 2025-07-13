import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule } from 'src/app/app-routing.module';

import { VideoLessonViewComponent } from './video-lesson-view.component';

describe('VideoLessonViewComponent', () => {
  let component: VideoLessonViewComponent;
  let fixture: ComponentFixture<VideoLessonViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VideoLessonViewComponent],
      imports: [
        RouterTestingModule,
        MatSnackBarModule,
        AppRoutingModule,
        HttpClientTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoLessonViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
