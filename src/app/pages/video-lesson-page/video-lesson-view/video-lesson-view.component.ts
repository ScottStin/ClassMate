import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { TempStylesDTO } from 'src/app/services/temp-styles-service/temp-styles-service.service';
import { VideoClassService } from 'src/app/services/video-class-service/video-class.service';
import { LessonDTO } from 'src/app/shared/models/lesson.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-video-lesson-view',
  templateUrl: './video-lesson-view.component.html',
  styleUrls: ['./video-lesson-view.component.scss'],
})
export class VideoLessonViewComponent implements OnInit, OnChanges {
  @Input() styles: TempStylesDTO;
  @Input() currentSchool: SchoolDTO | null;
  @Input() currentUser: UserDTO | null;
  @Input() lessons: LessonDTO[] | null;
  callFrame!: DailyCall;
  roomName: string | null;
  currentLesson?: LessonDTO;
  callStarted = false;

  constructor(
    private readonly route: ActivatedRoute,
    public readonly videoClassService: VideoClassService
  ) {}

  ngOnInit(): void {
    //
    // --- Get the room name (id) from the route params
    this.route.params.subscribe((params) => {
      this.roomName = params['id'] as string;

      // if (this.lessons && this.lessons.length > 0) {
      //   //
      //   // --- get current lesson details
      //   this.currentLesson = this.lessons.find(
      //     (lesson) => lesson._id === this.roomName
      //   );

      //   // --- Init call
      //   this.initializeCall()
      //     .then(() => {
      //       // eslint-disable-next-line no-console
      //       console.log('Call initialized');
      //     })
      //     .catch((err) => {
      //       // eslint-disable-next-line no-console
      //       console.error('Error initializing call', err);
      //     });
      // }
    });
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if ('lessons' in changes && this.lessons && this.lessons.length > 0) {
      this.currentLesson = this.lessons.find(
        (lesson) => lesson._id === this.roomName
      );
      await this.initializeCall();
    }
  }

  async initializeCall(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const videoContainer = document.querySelector(
      '.video-container'
    ) as HTMLElement;

    this.callFrame = DailyIframe.createFrame(videoContainer, {
      showLeaveButton: true,
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
      },
      theme: {
        colors: {
          accent: this.styles.primaryButtonBackgroundColor,
          accentText: this.styles.primaryButtonTextColor,
          // background: this.styles.backgroundColor?.name,
        },
      },
    });

    // Create token for joining user and set owner/admin privallages
    if (this.roomName !== null) {
      let canAdmin = false;
      let isOwner = false;

      if (
        ['teacher', 'school', 'admin'].includes(
          (this.currentUser?.userType ?? '').toLowerCase()
        )
      ) {
        canAdmin = true; // all teachers will have admin privvlages
      }

      if (this.currentLesson?.teacher === this.currentUser?.email) {
        isOwner = true; // The teacher who created the lesson will have owner privllages
      }

      const token = (await this.videoClassService.createOwnerToken(
        this.roomName,
        isOwner,
        canAdmin
      )) as string;

      await this.callFrame.join({
        url: `https://class-mate.daily.co/${this.roomName}`,
        token,
      });
    }
  }
}
