import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { CreateUserDTO, UserDTO } from 'src/app/shared/models/user.model';
import { environment } from 'src/environments/environment';

import { AuthStoreService } from '../auth-store-service/auth-store.service';
import { ErrorService } from '../error-message.service/error-message.service';
import { ExamService } from '../exam-service/exam.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/users`;
  private readonly userSubject = new BehaviorSubject<UserDTO[]>([]);
  users$ = this.userSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService,
    private readonly examService: ExamService,
    private readonly authStoreService: AuthStoreService
  ) {}

  getAll(): Observable<UserDTO[]> {
    return this.httpClient.get<UserDTO[]>(`${this.baseUrl}`).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load users');
      }),
      tap((users) => {
        this.userSubject.next(users);
      })
    );
  }

  getAllBySchoolId(currentSchoolId: string): Observable<UserDTO[]> {
    // const currentSchoolId = '6606c02560bf6509c83d8b5b'; // replace with actual value
    return this.httpClient
      .get<UserDTO[]>(`${this.baseUrl}?currentSchoolId=${currentSchoolId}`)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to load users');
        }),
        tap((users) => {
          this.userSubject.next(users);
        })
      );
  }

  create(data: CreateUserDTO): Observable<UserDTO> {
    return this.httpClient.post<UserDTO>(`${this.baseUrl}`, data).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to create new user');
      })
    );
  }

  update(
    data: Partial<UserDTO> & {
      previousProfilePicture?: {
        url: string;
        filename: string;
      } | null;
    },
    id: string
  ): Observable<UserDTO> {
    return this.httpClient.patch<UserDTO>(`${this.baseUrl}/${id}`, data).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to update user');
      })
    );
  }

  updateCurrentUser(
    data: Partial<UserDTO> & {
      previousProfilePicture?: {
        url: string;
        filename: string;
      } | null;
    },
    id: string
  ): Observable<UserDTO> {
    return this.httpClient.patch<UserDTO>(`${this.baseUrl}/${id}`, data).pipe(
      tap((updatedUser) => {
        this.authStoreService.updateCurrentUser(updatedUser);
      }),
      catchError((error: Error) => {
        this.handleError(error, 'Failed to update user');
      })
    );
  }

  delete(id: string): Observable<UserDTO> {
    return this.httpClient.delete<UserDTO>(`${this.baseUrl}/${id}`).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to delete user');
      })
    );
  }

  // login(user: UserLoginDTO): Observable<unknown> {
  //   return this.httpClient.post<unknown>(`${this.baseUrl}/login`, user).pipe(
  //     catchError((error: Error) => {
  //       this.handleError(error, 'Failed to login');
  //     })
  //   );
  // }

  private handleError(error: Error, message: string): never {
    if (error instanceof HttpErrorResponse) {
      throw this.errorService.handleHttpError(error);
    }
    throw this.errorService.handleGenericError(error, message);
  }
}
