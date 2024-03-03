import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { environment } from 'src/environments/environment';

import { AuthStoreService } from '../auth-store-service/auth-store.service';
import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  private readonly baseUrl = `${environment.apiUrl}/schools`;
  private readonly schoolSubject = new BehaviorSubject<SchoolDTO[]>([]);
  schools$ = this.schoolSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService,
    private readonly authStoreService: AuthStoreService
  ) {}

  getAll(): Observable<SchoolDTO[]> {
    return this.httpClient.get<SchoolDTO[]>(`${this.baseUrl}`).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load schools');
      }),
      tap((schools) => {
        console.log(schools);
        this.schoolSubject.next(schools);
      })
    );
  }

  create(data: SchoolDTO): Observable<SchoolDTO> {
    console.log(data);
    return this.httpClient.post<SchoolDTO>(`${this.baseUrl}`, data).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to create new school');
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
