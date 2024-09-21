import { TestBed } from '@angular/core/testing';

import { VideoClassService } from './video-class.service';

describe('VideoClassService', () => {
  let service: VideoClassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoClassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
