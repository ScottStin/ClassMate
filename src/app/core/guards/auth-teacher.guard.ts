import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { catchError, first, Observable, of, switchMap } from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserDTO } from 'src/app/shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthTeacherGuard implements CanActivate {
  isLoggedIn$: Observable<boolean>;
  currentUser$: Observable<UserDTO | null>;

  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly router: Router,
    public readonly authStoreService: AuthStoreService
  ) {}

  private handleAccessDenied(): UrlTree {
    this.snackbarService.queueBar(
      'warn',
      'You must be a teacher to access this page.'
    );
    return this.router.parseUrl(`/home`);
  }

  accessPermissionNotTeacher(): Observable<boolean> {
    this.currentUser$ = this.authStoreService.currentUser$;
    return this.currentUser$.pipe(
      switchMap((currentUser: UserDTO | null) => {
        if (
          currentUser &&
          !['teacher', 'school', 'admin'].includes(
            currentUser.userType.toLowerCase()
          )
        ) {
          return of(false);
        } else {
          return of(true);
        }
      }),
      catchError(() => of(false)),
      first()
    );
  }

  canActivate(): Observable<true | UrlTree> {
    return this.accessPermissionNotTeacher().pipe(
      switchMap((isAdminAccessAllowed) => {
        if (!isAdminAccessAllowed) {
          return of(this.handleAccessDenied());
        } else {
          return of(true as const);
        }
      })
    );
  }
}
