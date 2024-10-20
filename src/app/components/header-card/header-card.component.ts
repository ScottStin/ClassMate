import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize, Observable } from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { screenSizeBreakpoints } from 'src/app/shared/config';
import { NotificationDTO } from 'src/app/shared/models/notification.mode';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { MenuItemDTO, menuItems } from '../side-nav/side-nav.component';

@UntilDestroy()
@Component({
  selector: 'app-header-card',
  templateUrl: './header-card.component.html',
  styleUrls: ['./header-card.component.scss'],
})
export class HeaderCardComponent implements OnInit {
  @ViewChild('notificationsMenuTrigger', { static: false })
  notificationsMenuTrigger: MatMenuTrigger;

  @Output() closeSideNav = new EventEmitter();
  @Output() headerButtonAction = new EventEmitter();
  @Output() filterResults = new EventEmitter<string>();
  @Input() currentSchool: SchoolDTO | null;
  @Input() currentUser: UserDTO | null;
  @Input() users: UserDTO[] | null;
  @Input() pageName: string;

  breadCrumb: string | undefined = '';
  searchBar: string | undefined = '';
  icon: string | undefined = '';
  headerButton: string | undefined = '';
  headerButtonIcon: string | undefined = '';
  headerButtonFunction: string | undefined = '';
  menuItems: MenuItemDTO[] = menuItems;
  notifications$: Observable<NotificationDTO[]>;
  unseenNotificationsCount = 0;
  notifiationsLoading = false;
  notificationAnimation = '';

  // --- screen sizes:
  largeScreen = false;
  mediumScreen = false;
  smallScreen = false;

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.largeScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.large, 10);
    this.mediumScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.medium, 10);
    this.smallScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
  }

  constructor(
    public readonly authStoreService: AuthStoreService,
    public readonly notificationService: NotificationService,
    public dialog: MatDialog,
    public snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.notifiationsLoading = true;
    this.notifications$ = this.notificationService.notifications$;
    this.getNotifications();

    this.notificationService.notifications$
      .pipe(untilDestroyed(this))
      .subscribe((notifications) => {
        this.unseenNotificationsCount = notifications.filter(
          (notification) =>
            !notification.seenBy.includes(this.currentUser?._id ?? '')
        ).length;

        this.notifiationsLoading = false;

        // -- Trigger notificaiton 'ding' animation:
        this.notificationAnimation = 'ding-animation';
        setTimeout(() => {
          this.notificationAnimation = '';
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 700);
      });

    this.breadCrumb = this.pageName;
    const menuItem = this.menuItems.find(
      (obj) => obj.breadcrumb === this.pageName
    );
    if (menuItem) {
      this.searchBar = menuItem.searchBar;
      this.headerButton = menuItem.headerButton;
      this.headerButtonIcon = menuItem.headerButtonIcon;
      this.headerButtonFunction = menuItem.headerButtonFunction;
      this.icon = menuItem.icon;
    }
  }

  getNotifications(): void {
    this.notificationService
      .getAllByUserId(this.currentUser?._id ?? '')
      .pipe(
        finalize(() => {
          this.notifiationsLoading = false;
        }),
        untilDestroyed(this)
      )
      .subscribe((notifications) => {
        this.unseenNotificationsCount = notifications.filter(
          (notification) =>
            !notification.seenBy.includes(this.currentUser?._id ?? '')
        ).length;
      });
  }

  closeSideNavClick(): void {
    this.closeSideNav.emit();
  }

  headerButtonClick(): void {
    this.headerButtonAction.emit();
  }

  filterResultsKeyup(text: string): void {
    this.filterResults.emit(text);
  }

  // Notifications:

  markNotificationsAsSeen(): void {
    this.notificationService
      .getAllByUserId(this.currentUser?._id ?? '')
      .pipe(untilDestroyed(this))
      .subscribe((notifications) => {
        this.unseenNotificationsCount = notifications.filter(
          (notification) =>
            !notification.seenBy.includes(this.currentUser?._id ?? '')
        ).length;

        this.notificationService
          .markAllAsSeen({
            notifications,
            currentUserId: this.currentUser?._id ?? '',
          })
          .subscribe();
      });
  }

  closeNotificationDialog(): void {
    if (this.notificationsMenuTrigger.menuOpen) {
      this.notificationsMenuTrigger.closeMenu();
    }
  }
}
