import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SchoolService } from 'src/app/services/school-service/school.service';
import {
  TempStylesDTO,
  TempStylesService,
} from 'src/app/services/temp-styles-service/temp-styles-service.service';
import {
  BackgroundImageDTO,
  backgroundImages,
} from 'src/app/shared/background-images';
import { defaultStyles } from 'src/app/shared/default-styles';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-video-lesson-page',
  templateUrl: './video-lesson-page.component.html',
  styleUrls: ['./video-lesson-page.component.css'],
})
export class VideoLessonPageComponent implements OnInit, OnDestroy {
  /**
   * Page data:
   */

  currentSchool$: Observable<SchoolDTO | null>;
  private currentSchoolSubscription: Subscription | null;

  /**
   * Styling:
   */

  defaultStyles = defaultStyles;
  styles: TempStylesDTO = {
    primaryButtonBackgroundColor:
      this.defaultStyles.primaryButtonBackgroundColor,
    primaryButtonTextColor: this.defaultStyles.primaryButtonTextColor,
  };
  backgroundImages = backgroundImages;
  selectedBackgroundImage: BackgroundImageDTO | null = this.backgroundImages[0];

  constructor(
    public readonly schoolService: SchoolService,
    public readonly tempStylesService: TempStylesService
  ) {}

  ngOnInit(): void {
    this.getCurrentSchoolDetails();
  }

  // todo: replace with service;
  // getTempStyles(): void {
  //   this.temporaryStylesSubscription = this.temporaryStyles$.subscribe(
  //     (tempStyles) => {
  //       if (tempStyles) {
  //         if (tempStyles.backgroundColor !== undefined) {
  //           this.selectedBackgroundImage = tempStyles.backgroundColor;
  //         }
  //       } else {
  //         this.getCurrentSchoolDetails();
  //       }
  //     }
  //   );
  // }

  // todo: replace with service;
  getCurrentSchoolDetails(): void {
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.currentSchoolSubscription = this.currentSchool$.subscribe(
      (currentSchool) => {
        console.log(currentSchool?.primaryButtonBackgroundColor);
        if (currentSchool) {
          // --- get backgroud image:
          const backgroundImage = currentSchool.backgroundImage as
            | BackgroundImageDTO
            | undefined;

          if (backgroundImage !== undefined) {
            this.selectedBackgroundImage = currentSchool.backgroundImage;
          }

          // --- get primary color:
          const primaryButtonBackgroundColor =
            currentSchool.primaryButtonBackgroundColor as string | undefined;

          if (primaryButtonBackgroundColor !== undefined) {
            this.styles.primaryButtonBackgroundColor =
              primaryButtonBackgroundColor;
          }

          // --- get text color:
          const primaryButtonTextColor =
            currentSchool.primaryButtonTextColor as string | undefined;

          if (primaryButtonTextColor !== undefined) {
            this.styles.primaryButtonTextColor = primaryButtonTextColor;
          }

          // --- get text color:
          const logo = currentSchool.logo as
            | { filename: string; url: string }
            | undefined;

          if (logo !== undefined) {
            // this.styles.logo = logo;
            console.log(logo);
          }
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.currentSchoolSubscription) {
      this.currentSchoolSubscription.unsubscribe();
    }
  }
}
