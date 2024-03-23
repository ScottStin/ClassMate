import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Observable, Subscription } from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import { UserService } from 'src/app/services/user-service/user.service';
import {
  BackgroundImageDTO,
  backgroundImages,
} from 'src/app/shared/background-images';
import { defaultStyles } from 'src/app/shared/default-styles';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer: MatDrawer;
  showFiller = false;

  currentSchool$: Observable<SchoolDTO | null>;
  private currentSchoolSubscription: Subscription | null;
  private currentUserSubscription: Subscription | null;
  currentUser$: Observable<UserDTO | null>;
  users$: Observable<UserDTO[]>;
  private userSubscription: Subscription | null;

  defaultStyles = defaultStyles;
  styles = {
    primaryButtonBackgroundColor:
      this.defaultStyles.primaryButtonBackgroundColor,
    primaryButtonTextColor: this.defaultStyles.primaryButtonTextColor,
  };
  backgroundImages = backgroundImages;
  selectedBackgroundImage: BackgroundImageDTO | null = this.backgroundImages[0];

  constructor(
    public readonly schoolService: SchoolService,
    public readonly authStoreService: AuthStoreService,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.userSubscription = this.users$.subscribe();
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.currentUser$ = this.authStoreService.currentUser$;
    this.currentUserSubscription = this.currentUser$.subscribe();
    this.getCurrentSchoolDetails();
  }

  getCurrentSchoolDetails(): void {
    this.currentSchoolSubscription = this.currentSchool$.subscribe(
      (currentSchool) => {
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
        }
      }
    );
  }

  async closeSideNav(): Promise<void> {
    await this.drawer.toggle();
  }

  ngOnDestroy(): void {
    if (this.currentSchoolSubscription) {
      this.currentSchoolSubscription.unsubscribe();
    }
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
