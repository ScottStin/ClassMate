/* eslint-disable @typescript-eslint/strict-boolean-expressions */
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
  @Input() disableForms: boolean;
  @Output() responseChange = new EventEmitter<any>();

  isRecording = false;
  recordedTime: string;
  blobUrl: any;
  teste: any;
  recordingTimeout: any;
  maxRecordingTime = 11; // Maximum recording time in seconds

  constructor(
    private readonly audioRecordingService: AudioRecordingService,
    private readonly sanitizer: DomSanitizer
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
    this.maxRecordingTime = (this.question?.length ?? 10) + 1;
    this.preloadAudio();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('question' in changes) {
      this.maxRecordingTime = (this.question?.length ?? 10) + 1;
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

    if (studentResponse?.response) {
      setTimeout(() => {
        this.blobUrl = studentResponse.response;
      }, 110);
    }
  }

  startRecording(): void {
    if (!this.isRecording) {
      this.isRecording = true;
      this.audioRecordingService.startRecording();

      // Automatically stop recording after maxRecordingTime seconds
      this.recordingTimeout = setTimeout(() => {
        // Call the async function without `await`
        this.stopRecording();
      }, this.maxRecordingTime * 1000);
    }
  }

  abortRecording(): void {
    if (this.isRecording) {
      this.isRecording = false;
      this.audioRecordingService.abortRecording();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      clearTimeout(this.recordingTimeout); // Clear timeout if recording is aborted
    }
  }

  stopRecording(): void {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      clearTimeout(this.recordingTimeout); // Clear timeout if recording stops

      setTimeout(async () => {
        try {
          // Extract the blob URL from SafeUrlImpl if it's wrapped in a SafeUrlImpl object
          const blobUrl =
            this.blobUrl.changingThisBreaksApplicationSecurity || this.blobUrl;

          // Convert blobUrl to Base64
          const base64String = await this.convertBlobToBase64(blobUrl);

          // Emit the results:
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
      reader.onloadend = (): void => {
        resolve(reader.result as string);
      }; // Base64 string
      reader.onerror = (error): void => {
        reject(error);
      };
      reader.readAsDataURL(blob); // Convert Blob to Base64
    });
  }

  ngOnDestroy(): void {
    this.abortRecording();
  }
}
