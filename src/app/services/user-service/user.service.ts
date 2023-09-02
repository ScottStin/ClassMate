import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { UserDTO } from 'src/app/shared/models/user.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/users`;
  private readonly userSubject = new BehaviorSubject<UserDTO[]>([]);
  users$ = this.userSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService
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

  create(data: UserDTO): Observable<UserDTO> {
    return this.httpClient.post<UserDTO>(`${this.baseUrl}`, data).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to create new user');
      })
    );
  }

  update(data: UserDTO, id: string): Observable<UserDTO> {
    return this.httpClient.patch<UserDTO>(`${this.baseUrl}/${id}`, data).pipe(
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

  // login(user: UserDTO): Observable<UserDTO> {
  //   return this.httpClient.post<UserDTO>(`${this.baseUrl}/login`, user).pipe(
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
