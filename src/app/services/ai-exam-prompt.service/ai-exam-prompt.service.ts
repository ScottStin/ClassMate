import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class AiExamPromptService {
  private readonly baseUrl = `${environment.apiUrl}/ai-prompt-generator`;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService
  ) {}

  generateAiPromptAudio(data: AiPromptGenerator): Observable<Blob> {
    return this.httpClient
      .post(`${this.baseUrl}/audio`, data, {
        responseType: 'blob',
      })
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to generate Ai prompt');
        })
      );
  }

  generateAiPromptWritten(data: AiPromptGenerator): Observable<string> {
    return this.httpClient.post<string>(`${this.baseUrl}/written`, data).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to generate Ai prompt');
      })
    );
  }

  private handleError(error: Error, message: string): never {
    if (error instanceof HttpErrorResponse) {
      throw this.errorService.handleHttpError(error);
    }

    throw this.errorService.handleGenericError(error, message);
  }
}

export interface AiPromptGenerator {
  prompt: string;
  accent?: string;
  gender?: string;
  isAudioPrompt: boolean;
}
