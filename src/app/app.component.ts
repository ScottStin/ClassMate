import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first, Observable, Subscription } from 'rxjs';

import { schools } from './app-routing.module';
import { SchoolService } from './services/school-service/school.service';
import { SnackbarService } from './services/snackbar-service/snackbar.service';
import { SchoolDTO } from './shared/models/school.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  title = 'ClassMate';

  private readonly routerSubscription: Subscription | undefined;
  schools$: Observable<SchoolDTO[]>;
  currentSchool$: Observable<SchoolDTO | null>;

  constructor(
    private readonly schoolService: SchoolService,
    private readonly snackbarService: SnackbarService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.routerSubscription = this.router.events.subscribe(() => {
      setTimeout(() => {
        this.currentSchool$.pipe(first()).subscribe((currentSchool) => {
          if (
            this.router.url.split('/')[1] &&
            currentSchool?.name.replace(/ /gu, '-').toLowerCase() !==
              this.router.url.split('/')[1]
          ) {
            if (
              schools
                .map((obj) => obj.toLocaleLowerCase())
                .includes(this.router.url.split('/')[1])
            ) {
              this.getSchools();
            }
            // else {
            //   this.router.navigateByUrl('/school/signup');
            // }
          }
        });
      });
    }); // todo = move routerSubscription to service
  }

  getSchools(): void {
    this.schools$ = this.schoolService.schools$;
    this.schoolService.getAll().subscribe({
      next: (res) => {
        console.log(res);
        const currentSchool = res.find(
          (obj) =>
            obj.name.replace(/ /gu, '-').toLowerCase() ===
            this.router.url.split('/')[1].toLowerCase()
        );
        if (currentSchool) {
          this.schoolService.updateCurrentSchool(currentSchool);
        }
      },
      error: () => {
        const snackbar = this.snackbarService.openPermanent(
          'error',
          'Error: Failed to load site.',
          'retry'
        );
        snackbar
          .onAction()
          .pipe(first())
          .subscribe(() => {
            this.getSchools();
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
