import { Injectable } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import { Observable, Subject } from 'rxjs';

// demo: https://stackblitz.com/edit/angular-audio-recorder?file=src%2Fapp%2Fapp.component.ts,src%2Fapp%2Fapp.component.css

interface RecordedAudioOutput {
  blob: Blob;
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class AudioRecordingService {
  private stream: any;
  private recorder: any;
  private interval: any;
  private startTime: any;
  private _recorded = new Subject<RecordedAudioOutput>();
  private _recordingTime = new Subject<string>();
  private _recordingFailed = new Subject<string>();

  getRecordedBlob(): Observable<RecordedAudioOutput> {
    return this._recorded.asObservable();
  }

  getRecordedTime(): Observable<string> {
    return this._recordingTime.asObservable();
  }

  recordingFailed(): Observable<string> {
    return this._recordingFailed.asObservable();
  }

  startRecording() {
    if (this.recorder) {
      // It means recording is already started or it is already recording something
      return;
    }

    this._recordingTime.next("00:00");
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(s => {
        this.stream = s;
        this.record();
      })
      .catch(error => {
        // this._recordingFailed.next();
      });
  }

  abortRecording() {
    this.stopMedia();
  }

  private record(): void {
    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
      type: 'audio',
      mimeType: 'audio/webm',
    });
  
    this.recorder.record();
    this.startTime = new Date(); // Using the current time as the start time
    this.interval = setInterval(() => {
      const currentTime = new Date(); // Current time
      const diffTime = currentTime.getTime() - this.startTime.getTime(); // Difference in milliseconds
      const minutes = Math.floor(diffTime / 60000); // Convert milliseconds to minutes
      const seconds = Math.floor((diffTime % 60000) / 1000); // Convert remainder to seconds
  
      const time = `${this.toString(minutes)}:${this.toString(seconds)}`;
      this._recordingTime.next(time);
    }, 1000);
  }

  private toString(value: any) {
    let val = value;
    if (!value) val = "00";
    if (value < 10) val = "0" + value;
    return val;
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stop(
        (blob: any) => {
          if (this.startTime) {
            const mp3Name = encodeURIComponent(
              "audio_" + new Date().getTime() + ".mp3"
            );
            this.stopMedia();
            this._recorded.next({ blob: blob, title: mp3Name });
          }
        },
        () => {
          this.stopMedia();
          // this._recordingFailed.next();
        }
      );
    }
  }

  private stopMedia() {
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach((track: any) => track.stop());
        this.stream = null;
      }
    }
  }
}