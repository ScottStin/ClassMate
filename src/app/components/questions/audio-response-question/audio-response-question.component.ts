/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { AudioRecordingService } from 'src/app/services/audio-recording-service/audio-recording.service';

@Component({
  selector: 'app-audio-response-question',
  templateUrl: './audio-response-question.component.html',
  styleUrls: ['./audio-response-question.component.scss'],
})
export class AudioResponseQuestionComponent implements OnDestroy {
  @ViewChild('progressBar') progressBar: MatProgressBar | undefined;

  isRecording = false;
  recordedTime: any;
  blobUrl: any;
  teste: any;
  recordingTimeout: any;
  maxRecordingTime = 10; // Maximum recording time in seconds

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

  stopRecording(): void {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
      clearTimeout(this.recordingTimeout); // Clear timeout if recording stops
    }
  }

  clearRecordedData(): void {
    this.blobUrl = null;
  }

  getRecordingProgressBarValue(): number {
    const [minutes, seconds] = this.recordedTime.split(':').map(Number);
    const secondsNumber = minutes * 60 + seconds
    return ((100 / this.maxRecordingTime) * secondsNumber);
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
