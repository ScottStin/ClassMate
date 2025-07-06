import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { map, Observable, shareReplay, Subscription } from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SchoolService } from 'src/app/services/school-service/school.service';
import {
  TempStylesDTO,
  TempStylesService,
} from 'src/app/services/temp-styles-service/temp-styles-service.service';
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
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit, OnDestroy {
  /**
   * Page data:
   */

  currentSchool$: Observable<SchoolDTO | null>;
  private currentSchoolSubscription: Subscription | null;
  private currentUserSubscription: Subscription | null;
  private temporaryStylesSubscription: Subscription | null;
  currentUser$: Observable<UserDTO | null>;
  users$: Observable<UserDTO[]>;
  temporaryStyles$: Observable<TempStylesDTO | null>;
  private userSubscription: Subscription | null;

  /**
   * Styling:
   */

  defaultStyles = defaultStyles;
  styles = {
    primaryButtonBackgroundColor:
      this.defaultStyles.primaryButtonBackgroundColor,
    primaryButtonTextColor: this.defaultStyles.primaryButtonTextColor,
    warnColor: this.defaultStyles.warnColor,
    errorColor: this.defaultStyles.errorColor,
  };
  backgroundImages = backgroundImages;
  selectedBackgroundImage: BackgroundImageDTO | null = this.backgroundImages[0];

  /**
   * Set sidenav drawer size:
   */

  sideNavOpen = true;
  sideNavWidthOpen = 'auto';
  sideNavWidthClosed = '80px';
  @ViewChild('drawer') drawer: MatDrawer;

  /**
   * Check screen size:
   */

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Small, Breakpoints.XSmall])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    public readonly schoolService: SchoolService,
    public readonly authStoreService: AuthStoreService,
    private readonly userService: UserService,
    public readonly tempStylesService: TempStylesService,
    private readonly breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.userSubscription = this.users$.subscribe();
    this.currentSchool$ = this.schoolService.currentSchool$;
    this.currentUser$ = this.authStoreService.currentUser$;
    this.temporaryStyles$ = this.tempStylesService.temporaryStyles$;
    this.currentUserSubscription = this.currentUser$.subscribe();
    this.getCurrentSchoolDetails();
    this.getTempStyles();

    this.setGlobalRootStyle('sideNavWidth', this.sideNavWidthOpen);
    this.isHandset$.subscribe((isHandset) => {
      this.sideNavOpen = !isHandset;
      this.setGlobalRootStyle(
        'sideNavWidth',
        this.sideNavOpen ? this.sideNavWidthOpen : this.sideNavWidthClosed
      );
    });
  }

  getTempStyles(): void {
    this.temporaryStylesSubscription = this.temporaryStyles$.subscribe(
      (tempStyles) => {
        if (tempStyles) {
          if (tempStyles.backgroundColor !== undefined) {
            this.selectedBackgroundImage = tempStyles.backgroundColor;
          }
        } else {
          this.getCurrentSchoolDetails();
        }
      }
    );
  }

  getCurrentSchoolDetails(): void {
    this.currentSchoolSubscription = this.currentSchool$.subscribe(
      (currentSchool) => {
        if (currentSchool) {
          // --- get backgroud image:
          const backgroundImage = currentSchool.backgroundImage as
            | BackgroundImageDTO
            | undefined;

          if (backgroundImage) {
            this.selectedBackgroundImage = currentSchool.backgroundImage;
            this.setGlobalRootStyle(
              'backgroundImage',
              JSON.stringify(currentSchool.backgroundImage)
            );
          }

          // --- get primary color:
          const primaryButtonBackgroundColor =
            currentSchool.primaryButtonBackgroundColor as string | undefined;

          if (primaryButtonBackgroundColor) {
            this.styles.primaryButtonBackgroundColor =
              primaryButtonBackgroundColor;

            this.setGlobalRootStyle(
              'primaryColor',
              primaryButtonBackgroundColor
            );
          }

          // --- get text color:
          const primaryButtonTextColor =
            currentSchool.primaryButtonTextColor as string | undefined;

          if (primaryButtonTextColor) {
            this.styles.primaryButtonTextColor = primaryButtonTextColor;
            this.setGlobalRootStyle('secondaryColor', primaryButtonTextColor);
          }

          // --- get warnColor color:
          const warnColor = currentSchool.warnColor as string | undefined;

          if (warnColor) {
            this.styles.warnColor = warnColor;
            this.setGlobalRootStyle('warnColor', warnColor);
          }

          // --- get errorColor color:
          const errorColor = currentSchool.errorColor as string | undefined;

          if (errorColor) {
            this.styles.errorColor = errorColor;
            this.setGlobalRootStyle('errorColor', errorColor);
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
    if (this.temporaryStylesSubscription) {
      this.temporaryStylesSubscription.unsubscribe();
    }
  }

  private setGlobalRootStyle(propertyName: string, value: string): void {
    const root = document.documentElement;
    root.style.setProperty(`--${propertyName}`, value);
  }
}
