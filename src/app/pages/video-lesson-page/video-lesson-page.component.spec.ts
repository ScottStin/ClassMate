import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoLessonPageComponent } from './video-lesson-page.component';

describe('VideoLessonPageComponent', () => {
  let component: VideoLessonPageComponent;
  let fixture: ComponentFixture<VideoLessonPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoLessonPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoLessonPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
