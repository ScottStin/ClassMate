import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, Subscription } from 'rxjs';

import { schools } from './app-routing.module';
import { AuthStoreService } from './services/auth-store-service/auth-store.service';
import { RouterService } from './services/router-service/router.service';
import { SchoolService } from './services/school-service/school.service';
import { SnackbarService } from './services/snackbar-service/snackbar.service';
import { SchoolDTO } from './shared/models/school.model';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ClassMate';

  private readonly routerSubscription: Subscription | undefined;
  schools$: Observable<SchoolDTO[]>;
  currentSchool$: Observable<SchoolDTO | null>;
  schools = schools;
  loggingOut$: Observable<boolean>;

  constructor(
    private readonly schoolService: SchoolService,
    private readonly authStoreService: AuthStoreService,
    private readonly routerService: RouterService,
    private readonly snackbarService: SnackbarService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.routerSubscription = this.router.events.subscribe(() => {
      // --- get school from local storage:
      const currentSchoolString = localStorage.getItem('current_school');
      let currentSchoolName: string | undefined = '';
      if (currentSchoolString !== null) {
        currentSchoolName = (
          JSON.parse(currentSchoolString) as SchoolDTO | undefined
        )?.name
          .replace(/ /gu, '-')
          .toLocaleLowerCase();
      }

      // --- check if current school has changed:
      setTimeout(() => {
        const schoolUrlName = this.router.url.split('/')[1].toLowerCase();
        if (schoolUrlName && currentSchoolName !== schoolUrlName) {
          if (
            schools
              .map((obj) => obj.toLocaleLowerCase())
              .includes(schoolUrlName)
          ) {
            this.getSchools(schoolUrlName);
          }
        }
      });
    });
  }

  ngOnInit(): void {
    this.authStoreService.loggingOut$.pipe(untilDestroyed(this)).subscribe();
  }

  getSchools(schoolUrlName: string): void {
    this.schools$ = this.schoolService.schools$;
    this.schoolService.getAll().subscribe({
      next: (res) => {
        // eslint-disable-next-line no-console
        console.log('Attempting to change schools...');

        // --- check if school from url exists
        const currentSchool = res.find(
          (obj) => obj.name.replace(/ /gu, '-').toLowerCase() === schoolUrlName
        );

        // --- if current school from url exists, change current schools
        if (currentSchool) {
          // eslint-disable-next-line no-console
          console.log('New school from URL successfully found...');

          this.schoolService.updateCurrentSchool(currentSchool);
          this.authStoreService.logout();
          const schoolName = currentSchool.name
            .replace(/ /gu, '-')
            .toLowerCase();
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          this.router.navigateByUrl(
            `${schoolName}/welcome`
          ) as Promise<boolean>;

          // eslint-disable-next-line no-console
          console.log('School successfully changed!');
        }
      },
      error: () => {
        this.snackbarService.queueBar('error', 'Error: Failed to load site.', {
          label: 'retry',
          registerAction: (onAction: Observable<void>) =>
            onAction.pipe(untilDestroyed(this)).subscribe(() => {
              this.getSchools(schoolUrlName);
            }),
        });
      },
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
