import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Observable, Subscription } from 'rxjs';
import { SchoolService } from 'src/app/services/school-service/school.service';
import {
  BackgroundImageDTO,
  backgroundImages,
} from 'src/app/shared/background-images';
import { SchoolDTO } from 'src/app/shared/models/school.model';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit {
  @ViewChild('drawer') drawer: MatDrawer;
  showFiller = false;
  currentSchool$: Observable<SchoolDTO | null>;
  private subscription: Subscription | null;

  backgroundImages = backgroundImages;
  selectedBackgroundImage: BackgroundImageDTO | null = this.backgroundImages[0];

  constructor(public readonly schoolService: SchoolService) {}

  ngOnInit(): void {
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.getCurrentSchoolDetails();
  }

  getCurrentSchoolDetails(): void {
    this.subscription = this.currentSchool$.subscribe((school) => {
      if (school) {
        // --- get backgroud image:
        const backgroundImage = school.backgroundImage as
          | BackgroundImageDTO
          | undefined;
        if (backgroundImage !== undefined) {
          this.selectedBackgroundImage = school.backgroundImage;
        }
      }
    });
  }

  async closeSideNav(): Promise<void> {
    await this.drawer.toggle();
  }
}
