import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { finalize, first, Observable, of, Subscription } from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { LessonService } from 'src/app/services/lesson-service/lesson.service';
import { LessonTypeService } from 'src/app/services/lesson-type-service/lesson-type.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import {
  TempStylesDTO,
  TempStylesService,
} from 'src/app/services/temp-styles-service/temp-styles-service.service';
import {
  BackgroundImageDTO,
  backgroundImages,
} from 'src/app/shared/background-images';
import { defaultStyles } from 'src/app/shared/default-styles';
import { LessonDTO, LessonTypeDTO } from 'src/app/shared/models/lesson.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { AdminViewComponent } from './admin-view/admin-view.component';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css'],
})
export class AdminPageComponent implements OnInit, OnDestroy {
  @ViewChild(AdminViewComponent)
  adminViewComponent: AdminViewComponent;
  adminPageLoading = true;
  lessonPageLoading = true;

  // --- auth data and subscriptions:
  private currentSchoolSubscription: Subscription | null;
  private temporaryStylesSubscription: Subscription | null;
  currentUser$: Observable<UserDTO | null>;
  currentSchool$: Observable<SchoolDTO | null>;
  lessons$: Observable<LessonDTO[] | null>;

  // --- styles:
  defaultStyles = defaultStyles;
  primaryButtonBackgroundColor =
    this.defaultStyles.primaryButtonBackgroundColor;
  primaryButtonTextColor = this.defaultStyles.primaryButtonTextColor;
  selectedBackgroundImage = this.defaultStyles.selectedBackgroundImage;
  backgroundImages = backgroundImages;
  temporaryStyles$: Observable<TempStylesDTO | null>;

  constructor(
    private readonly snackbarService: SnackbarService,
    public readonly authStoreService: AuthStoreService,
    public readonly tempStylesService: TempStylesService,
    public readonly schoolService: SchoolService,
    public readonly lessonTypeService: LessonTypeService,
    public readonly lessonService: LessonService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.temporaryStyles$ = this.tempStylesService.temporaryStyles$;
    this.currentUser$ = this.authStoreService.currentUser$;
    this.lessons$ = this.lessonService.lessons$;
    this.getCurrentSchoolDetails();
    this.getTempStyles();
  }

  getTempStyles(): void {
    this.temporaryStylesSubscription = this.temporaryStyles$.subscribe(
      (tempStyles) => {
        if (tempStyles) {
          if (tempStyles.primaryButtonBackgroundColor !== undefined) {
            this.primaryButtonBackgroundColor =
              tempStyles.primaryButtonBackgroundColor;
          }
          if (tempStyles.primaryButtonTextColor !== undefined) {
            this.primaryButtonTextColor = tempStyles.primaryButtonTextColor;
          }
          if (
            tempStyles.backgroundColor !== null &&
            tempStyles.backgroundColor !== undefined
          ) {
            this.selectedBackgroundImage = tempStyles.backgroundColor;
          }
        } else {
          this.getCurrentSchoolDetails();
        }
      }
    );
  }

  getCurrentSchoolDetails(): void {
    this.adminPageLoading = true;
    this.currentSchoolSubscription = this.currentSchool$.subscribe(
      (currentSchool) => {
        if (currentSchool) {
          // --- get styles:
          const primaryButtonBackgroundColor =
            currentSchool.primaryButtonBackgroundColor as string | undefined;

          const primaryButtonTextColor =
            currentSchool.primaryButtonTextColor as string | undefined;
          const selectedBackgroundImage = currentSchool.backgroundImage as
            | BackgroundImageDTO
            | undefined;

          if (primaryButtonBackgroundColor !== undefined) {
            this.primaryButtonBackgroundColor = primaryButtonBackgroundColor;
          }
          if (primaryButtonTextColor !== undefined) {
            this.primaryButtonTextColor = primaryButtonTextColor;
          }
          if (selectedBackgroundImage !== undefined) {
            this.selectedBackgroundImage = selectedBackgroundImage;
          }

          // --- get upcoming lessons:
          if (currentSchool._id !== null && currentSchool._id !== undefined) {
            this.lessonService
              .getAllBySchoolId(currentSchool._id)
              .pipe(
                first(),
                finalize(() => {
                  this.lessonPageLoading = false;
                })
              )
              .subscribe({
                next: (lessons) => {
                  const currentDateTime = new Date();
                  const filterdLessons = lessons.filter(
                    (lesson) => new Date(lesson.startTime) > currentDateTime
                  );
                  this.lessons$ = of(filterdLessons);
                },
                error: (error: Error) => {
                  const snackbar = this.snackbarService.openPermanent(
                    'error',
                    `Error: Failed to load page: ${error.message}`,
                    'retry'
                  );
                  snackbar
                    .onAction()
                    .pipe(first())
                    .subscribe(() => {
                      this.getCurrentSchoolDetails();
                    });
                },
              });
          }
        }
      }
    );
    this.adminPageLoading = false;
  }

  saveSchoolDetails(data: {
    key: string;
    value: string | LessonTypeDTO[];
  }): void {
    const updatedData = { [data.key]: data.value };
    this.schoolService
      .update(updatedData, '6609279a1adcaa324759e3f2')
      .subscribe({
        next: (school: SchoolDTO) => {
          this.snackbarService.open(
            'info',
            'School details successfully updated'
          );
          this.schoolService.updateCurrentSchool(school);
          // this.getCurrentSchoolDetails();
          setTimeout(() => {
            this.adminViewComponent.closeEdit();
          }, 0);
        },
        error: (error: Error) => {
          this.snackbarService.openPermanent('error', error.message);
        },
      });
  }

  updateTempStyles(tempStyles: TempStylesDTO | null): void {
    this.tempStylesService.updateTemporaryStyles(tempStyles);
  }

  ngOnDestroy(): void {
    if (this.currentSchoolSubscription) {
      this.currentSchoolSubscription.unsubscribe();
    }
    if (this.temporaryStylesSubscription) {
      this.temporaryStylesSubscription.unsubscribe();
    }
  }
}
