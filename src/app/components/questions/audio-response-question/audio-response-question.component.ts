/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AudioRecordingService } from 'src/app/services/audio-recording-service/audio-recording.service';

import { QuestionList } from '../../create-exam-dialog/create-exam-dialog.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-audio-response-question',
  templateUrl: './audio-response-question.component.html',
  styleUrls: ['./audio-response-question.component.scss'],
})
export class AudioResponseQuestionComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() question: QuestionList | null;
  @Input() currentUser: string | undefined;
  @Output() responseChange = new EventEmitter<any>();

  isRecording = false;
  recordedTime: any;
  blobUrl: any;
  teste: any;
  recordingTimeout: any;
  maxRecordingTime = 11; // Maximum recording time in seconds

  constructor(
    private readonly audioRecordingService: AudioRecordingService,
    private readonly sanitizer: DomSanitizer,
  ) {
    // stop recoridng on fail:
    this.audioRecordingService
      .recordingFailed()
      .subscribe(() => (this.isRecording = false));

    // update record time:
    this.audioRecordingService.getRecordedTime().subscribe((time) => {
      this.recordedTime = time;
    });

    this.audioRecordingService.getRecordedBlob().subscribe((data) => {
      this.teste = data;
      this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(data.blob)
      );
    });
  }

  ngOnInit(): void {
    this.maxRecordingTime = (this.question?.time ?? 10) + 1;
    this.preloadAudio();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('question' in changes) {
      console.log(this.question);
      this.maxRecordingTime = (this.question?.time ?? 10) + 1;
      this.stopRecording();
      setTimeout(() => {
        this.clearRecordedData();
      }, 100);
    }

    this.preloadAudio();
  }

  preloadAudio(): void {
    const studentResponse = this.question?.studentResponse?.find(
      (obj) => obj.student === this.currentUser
    );

    console.log(studentResponse);

    if (studentResponse?.response) {
      setTimeout(() => {
        
      this.blobUrl = studentResponse.response;
      }, 110);
      console.log(this.blobUrl);
    }
  }

  startRecording(): void {
    if (!this.isRecording) {
      this.isRecording = true;
      this.audioRecordingService.startRecording();

      // Automatically stop recording after maxRecordingTime seconds
      this.recordingTimeout = setTimeout(() => {
        this.stopRecording();
      }, this.maxRecordingTime * 1000);
    }
  }

  abortRecording(): void {
    if (this.isRecording) {
      this.isRecording = false;
      this.audioRecordingService.abortRecording();
      clearTimeout(this.recordingTimeout); // Clear timeout if recording is aborted
    }
  }

  async stopRecording(): Promise<void> {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
      clearTimeout(this.recordingTimeout); // Clear timeout if recording stops
  
      setTimeout(async () => {
        try {
          console.log(this.blobUrl);
  
          // Extract the blob URL from SafeUrlImpl if it's wrapped in a SafeUrlImpl object
          const blobUrl = (this.blobUrl as any).changingThisBreaksApplicationSecurity || this.blobUrl;
  
          // Convert blobUrl to Base64 and emit the result
          const base64String = await this.convertBlobToBase64(blobUrl);
          console.log(base64String);
          this.responseChange.emit(base64String);
        } catch (error) {
          console.error('Error converting Blob URL to Base64:', error);
        }
      }, 100);
    }
  }
  

  clearRecordedData(): void {
    this.blobUrl = null;
  }

  getRecordingProgressBarValue(): number {
    const [minutes, seconds] = this.recordedTime.split(':').map(Number);
    const secondsNumber = minutes * 60 + seconds;
    return (100 / (this.maxRecordingTime - 1)) * secondsNumber;
  }

  /**
   * Convert the url recording to a base64 encoded string:
   */
  async convertBlobToBase64(blobUrl: string): Promise<string> {
    // Fetch the Blob object from the blob URL
    const response = await fetch(blobUrl);
    const blob = await response.blob();
  
    // Convert Blob to Base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string); // Base64 string
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob); // Convert Blob to Base64
    });
  }

  ngOnDestroy(): void {
    this.abortRecording();
  }

  // download(): void {
  //   const url = window.URL.createObjectURL(this.teste.blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = this.teste.title;
  //   link.click();
  // }
}
