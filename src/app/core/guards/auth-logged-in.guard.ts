import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { catchError, first, map, Observable, of, switchMap } from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthLoggedInGuard implements CanActivate {
  isLoggedIn$: Observable<boolean>;
  user$: Observable<{ user: UserDTO } | null>;
  currentSchool$: Observable<SchoolDTO | null>;

  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly router: Router,
    public readonly authStoreService: AuthStoreService,
    private readonly schoolService: SchoolService
  ) {}

  private handleAccessDenied(): Observable<UrlTree> {
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.snackbarService.queueBar(
      'warn',
      'You must be logged in to access this page.'
    );
    return this.currentSchool$.pipe(
      map((currentSchool) => {
        let urlPath = '/home';
        if (currentSchool) {
          urlPath = `/${currentSchool.name
            .replace(/ /gu, '-')
            .toLowerCase()}/home`;
        }
        return this.router.parseUrl(urlPath);
      })
    );
  }

  accessPermissionLoggedOut(): Observable<boolean> {
    this.isLoggedIn$ = this.authStoreService.isLoggedIn$;
    return this.isLoggedIn$.pipe(
      switchMap((res: boolean) => {
        if (res) {
          return of(true);
        } else {
          return of(false);
        }
      }),
      catchError(() => of(false)),
      first()
    );
  }

  canActivate(): Observable<true | UrlTree> {
    return this.accessPermissionLoggedOut().pipe(
      switchMap((isAdminAccessAllowed) => {
        if (!isAdminAccessAllowed) {
          return this.handleAccessDenied();
        } else {
          return of(true as const);
        }
      })
    );
  }
}
