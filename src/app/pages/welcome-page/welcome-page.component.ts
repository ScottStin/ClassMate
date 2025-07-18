import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { TempStylesService } from 'src/app/services/temp-styles-service/temp-styles-service.service';
import {
  BackgroundImageDTO,
  backgroundImages,
} from 'src/app/shared/background-images';
import { defaultStyles } from 'src/app/shared/default-styles';
import { SchoolDTO } from 'src/app/shared/models/school.model';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
})
export class WelcomePageComponent implements OnInit, OnDestroy {
  private currentSchoolSubscription: Subscription | null;
  currentSchool$: Observable<SchoolDTO | null>;

  backgroundImages = backgroundImages;
  defaultStyles = defaultStyles;
  selectedBackgroundImage: BackgroundImageDTO =
    this.defaultStyles.selectedBackgroundImage;
  imageCards: { source: string; route: string; title: string }[] = [];

  logoSrc: string | undefined;

  constructor(
    public readonly schoolService: SchoolService,
    public readonly tempStylesService: TempStylesService
  ) {}

  ngOnInit(): void {
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.getCurrentSchoolDetails();
  }

  getCurrentSchoolDetails(): void {
    this.currentSchoolSubscription = this.currentSchool$.subscribe((school) => {
      if (school) {
        // --- get backgroud image:
        const backgroundImage = school.backgroundImage as
          | BackgroundImageDTO
          | undefined;

        if (backgroundImage) {
          this.selectedBackgroundImage = backgroundImage;
        } else {
          this.selectedBackgroundImage = this.backgroundImages[0];
        }

        // --- get logo:
        const logo = school.logoSecondary;
        this.logoSrc = logo.url;

        // --- get image cards:
        this.createImageCards(school);
      } else {
        this.createImageCards(undefined);
      }
    });
  }

  createImageCards(currentSchool: SchoolDTO | undefined): void {
    this.imageCards = [
      {
        source: '../../../assets/Student.png',
        route: currentSchool
          ? `/${currentSchool.name.replace(/ /gu, '-').toLowerCase()}/home`
          : '/home',
        title: 'Student',
      },
      {
        source: '../../../assets/Teacher.png',
        route: currentSchool
          ? `/${currentSchool.name
              .replace(/ /gu, '-')
              .toLowerCase()}/teacher/login`
          : '/teacher/login',
        title: 'Teacher',
      },
      {
        source: '../../../assets/School.png',
        route: currentSchool
          ? `/${currentSchool.name
              .replace(/ /gu, '-')
              .toLowerCase()}/school/login`
          : '/school/login',
        title: 'School',
      },
    ];
  }

  hoveredElementIndex: number | null = null;
  isAnyElementHovered = false;

  setHoveredElement(index: number | null): void {
    this.hoveredElementIndex = index;
    this.isAnyElementHovered = index !== null;
  }

  ngOnDestroy(): void {
    if (this.currentSchoolSubscription) {
      this.currentSchoolSubscription.unsubscribe();
    }
  }
}
