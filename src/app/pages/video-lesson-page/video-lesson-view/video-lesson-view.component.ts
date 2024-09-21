import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { TempStylesDTO } from 'src/app/services/temp-styles-service/temp-styles-service.service';
import { SchoolDTO } from 'src/app/shared/models/school.model';

@Component({
  selector: 'app-video-lesson-view',
  templateUrl: './video-lesson-view.component.html',
  styleUrls: ['./video-lesson-view.component.scss'],
})
export class VideoLessonViewComponent implements OnInit {
  @Input() styles: TempStylesDTO;
  @Input() currentSchool: SchoolDTO | null;
  callFrame!: DailyCall;
  roomName: string | null;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    console.log(this.styles);
    // Get the room name (id) from the route params
    this.route.params.subscribe((params) => {
      this.roomName = params['id'];
      console.log(this.roomName);
      this.initializeCall();
    });
  }

  initializeCall(): void {
    const videoContainer = document.querySelector('.video-container') as HTMLElement;
    
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
  
    this.callFrame.join({
      url: `https://class-mate.daily.co/${this.roomName}`, // Ensure this domain is correct,
      // theme: {
      //   colors: {
      //     accent: '#eb4034',
      //     // background: '#eb4034',
      //   },
      // },
    });
  }
}
