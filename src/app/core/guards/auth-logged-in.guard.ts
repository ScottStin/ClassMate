import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { catchError, first, Observable, of, switchMap } from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserDTO } from 'src/app/shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthLoggedInGuard implements CanActivate {
  isLoggedIn$: Observable<boolean>;
  user$: Observable<{ user: UserDTO } | null>;

  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly router: Router,
    public readonly authStoreService: AuthStoreService
  ) {}

  private handleAccessDenied(): UrlTree {
    this.snackbarService.openPermanent(
      'warn',
      'You must be logged in to access this page.'
    );
    return this.router.parseUrl(`/home`);
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
          return of(this.handleAccessDenied());
        } else {
          return of(true as const);
        }
      })
    );
  }
}
