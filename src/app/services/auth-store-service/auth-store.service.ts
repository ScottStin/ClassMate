import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  shareReplay,
  tap,
} from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserDTO, UserLoginDTO } from 'src/app/shared/models/user.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class AuthStoreService {
  private readonly baseUrl = `${environment.apiUrl}/users`;
  // private readonly subject = new BehaviorSubject<UserSubject>(null);
  private readonly currentUserSubject = new BehaviorSubject<CurrentUserSubject>(
    null
  );

  // user$: Observable<UserSubject> = this.subject.asObservable();
  currentUser$: Observable<CurrentUserSubject> =
    this.currentUserSubject.asObservable();

  isLoggedIn$: Observable<boolean>;
  isLoggedOut$: Observable<boolean>;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService,
    private readonly snackbarService: SnackbarService
  ) {
    // this.isLoggedIn$ = this.user$.pipe(map((user) => !!user));
    this.isLoggedIn$ = this.currentUser$.pipe(map((user) => !!user));
    this.isLoggedOut$ = this.isLoggedIn$.pipe(map((isLoggedIn) => !isLoggedIn));

    // const currentUser: string | null = localStorage.getItem('auth_data_token');
    // if (currentUser !== null) {
    //   this.subject.next(JSON.parse(currentUser) as UserSubject);
    // }

    const currentUserTest: string | null = localStorage.getItem('current_user');
    if (currentUserTest !== null) {
      this.currentUserSubject.next(
        JSON.parse(currentUserTest) as CurrentUserSubject
      );
    }
  }

  // updateCurrentUser(user: UserDTO): void {
  //   this.subject.next({ user });
  //   const currentUser = JSON.parse(localStorage.getItem('auth_data_token')!) as
  //     | { user: UserDTO }
  //     | undefined;
  //   if (currentUser) {
  //     currentUser.user = user;
  //     localStorage.setItem('auth_data_token', JSON.stringify(currentUser));
  //   }
  // }

  updateCurrentUser(user: UserDTO | null): void {
    this.currentUserSubject.next(user);
    const currentUserString = localStorage.getItem('current_user');
    let currentUser;
    if (currentUserString !== null) {
      currentUser = JSON.parse(currentUserString) as
        | { user: UserDTO }
        | undefined;
    }
    if (currentUser && user) {
      currentUser.user = user;
      localStorage.setItem('current_user', JSON.stringify(currentUser));
    }
  }

  login(
    user: UserLoginDTO,
    currentSchoolId: string
  ): Observable<{ user: UserDTO }> {
    return this.httpClient
      .post<{ user: UserDTO }>(`${this.baseUrl}/login`, {
        user,
        currentSchoolId,
      })
      .pipe(
        tap((res) => {
          // this.subject.next(res);
          // localStorage.setItem('auth_data_token', JSON.stringify(res));
          localStorage.setItem('current_user', JSON.stringify(res.user));
          this.updateCurrentUser(res.user);
        }),
        shareReplay(),
        catchError((error: HttpErrorResponse) => {
          this.snackbarService.open(
            'error',
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
            `${error.error.error}`
          );
          this.handleError(error, 'Failed to login');
        })
      );
  }

  logout(): void {
    // this.subject.next(null);
    // localStorage.removeItem('auth_data_token');
    localStorage.removeItem('current_user');
    this.updateCurrentUser(null);
  }

  private handleError(error: Error, message: string): never {
    if (error instanceof HttpErrorResponse) {
      throw this.errorService.handleHttpError(error);
    }
    throw this.errorService.handleGenericError(error, message);
  }

  /**
   * ==============================
   * TOKEN:
   *  - todo: impliment the logic below to add expiry to session
   * ==============================
   */

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // isAuthenticated(): boolean {
  //   // Check if the token exists and is not expired
  //   const token = this.getToken();
  //   if (token !== null) {
  //     const tokenData: TokenData = this.decodeToken(token) as TokenData;
  //     // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  //     const currentTime = Date.now() / 1000; // Convert to seconds
  //     // eslint-disable-next-line no-eq-null,, @typescript-eslint/no-unnecessary-condition
  //     return tokenData?.exp !== null && tokenData.exp > currentTime;
  //   }
  //   return false;
  // }

  // public decodeToken(token: string): any {
  //   try {
  //     const decodedToken = JSON.parse(atob(token.split('.')[1])) as TokenData;
  //     return decodedToken;
  //   } catch (error) {
  //     return null;
  //   }
  // }
}

// export type UserSubject = { user: UserDTO } | null;
export type CurrentUserSubject = UserDTO | null;

// interface TokenData {
//   exp: number;
//   [key: string]: any;
// }
