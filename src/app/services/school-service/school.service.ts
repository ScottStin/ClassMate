import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { CreateSchoolDTO, SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  private readonly baseUrl = `${environment.apiUrl}/schools`;
  private readonly schoolSubject = new BehaviorSubject<SchoolDTO[]>([]);
  private readonly currentSchoolSubject = new BehaviorSubject<SchoolSubject>(
    null
  );

  schools$ = this.schoolSubject.asObservable();

  currentSchool$: Observable<SchoolSubject | null> =
    this.currentSchoolSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService
  ) {
    const currentSchool: string | null = localStorage.getItem('current_school');
    if (currentSchool !== null) {
      this.currentSchoolSubject.next(
        JSON.parse(currentSchool) as SchoolSubject
      );
    }
  }

  updateCurrentSchool(school: SchoolDTO): void {
    this.currentSchoolSubject.next(school);
    localStorage.setItem('current_school', JSON.stringify(school));
  }

  schoolLogout(): void {
    this.currentSchoolSubject.next(null);
    localStorage.removeItem('current_school');
  }

  getAll(): Observable<SchoolDTO[]> {
    return this.httpClient.get<SchoolDTO[]>(`${this.baseUrl}`).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load schools');
      }),
      tap((schools) => {
        this.schoolSubject.next(schools);
      })
    );
  }

  create(data: CreateSchoolDTO): Observable<SchoolDTO> {
    return this.httpClient.post<SchoolDTO>(`${this.baseUrl}`, data).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to create new school');
      })
    );
  }

  update(
    data: Partial<SchoolDTO>,
    id: string
  ): Observable<{ school: SchoolDTO; user: UserDTO }> {
    return this.httpClient
      .patch<{ school: SchoolDTO; user: UserDTO }>(
        `${this.baseUrl}/${id}`,
        data
      )
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to update school');
        })
      );
  }

  delete(id: string): Observable<SchoolDTO> {
    return this.httpClient.delete<SchoolDTO>(`${this.baseUrl}/${id}`).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to delete school');
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

export type SchoolSubject = SchoolDTO | null;
