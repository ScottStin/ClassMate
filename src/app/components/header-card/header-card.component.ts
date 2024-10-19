import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Observable, Subscription } from 'rxjs';
// import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { notificationDemoData } from 'src/app/demo-data/demo-data';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { screenSizeBreakpoints } from 'src/app/shared/config';
import { NotificationDTO } from 'src/app/shared/models/notification.mode';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { MenuItemDTO, menuItems } from '../side-nav/side-nav.component';

@Component({
  selector: 'app-header-card',
  templateUrl: './header-card.component.html',
  styleUrls: ['./header-card.component.scss'],
})
export class HeaderCardComponent implements OnInit, OnDestroy {
  @ViewChild('notificationsMenuTrigger', { static: false })
  notificationsMenuTrigger: MatMenuTrigger;

  @Output() closeSideNav = new EventEmitter();
  @Output() headerButtonAction = new EventEmitter();
  @Output() filterResults = new EventEmitter<string>();
  @Input() currentSchool: SchoolDTO | null;
  @Input() currentUser: UserDTO | null;
  @Input() pageName: string;

  breadCrumb: string | undefined = '';
  searchBar: string | undefined = '';
  icon: string | undefined = '';
  headerButton: string | undefined = '';
  headerButtonIcon: string | undefined = '';
  headerButtonFunction: string | undefined = '';
  menuItems: MenuItemDTO[] = menuItems;
  notifications$: Observable<NotificationDTO[]>;
  notificationsSubscription: Subscription | null;
  unseenNotificationsCount = 0;

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
    this.notifications$ = this.notificationService.notifications$;
    this.notificationsSubscription = this.notificationService
      .getAllByUserId(this.currentUser?._id ?? '')
      .subscribe((notifications) => {
        this.unseenNotificationsCount = notifications.filter(
          (notification) =>
            !notification.seenBy.includes(this.currentUser?._id ?? '')
        ).length;
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

  closeSideNavClick(): void {
    this.closeSideNav.emit();
  }

  headerButtonClick(): void {
    this.headerButtonAction.emit();
  }

  // logout(): void {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     data: {
  //       title: 'Logout',
  //       message: 'Are you sure you want to logout?',
  //       okLabel: 'Logout',
  //       cancelLabel: 'Cancel',
  //       routerLink:
  //         this.currentSchool !== null
  //           ? `${this.currentSchool.name
  //               .replace(/ /gu, '-')
  //               .toLowerCase()}/welcome`
  //           : 'welcome',
  //     },
  //   });
  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result === true) {
  //       let firstName = 'mate';
  //       if (this.currentUser) {
  //         firstName = this.currentUser.name.split(' ')[0];
  //       }
  //       this.snackbarService.open('info', `Goodbye, ${firstName}!`);
  //       this.authStoreService.logout();
  //     }
  //   });
  // }

  filterResultsKeyup(text: string): void {
    this.filterResults.emit(text);
  }

  // Notifications:

  // getUnseenNotificationCount(): number {
  //   let count = 0;
  //   // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  //   if (this.currentUser?._id) {
  //     const currentUserId = this.currentUser._id;
  //     count = this.filteredNotifications.filter(
  //       (notification) => !notification.seenBy.includes(currentUserId)
  //     ).length;
  //   }
  //   return count;
  // }

  closeNotificationDialog(): void {
    if (this.notificationsMenuTrigger.menuOpen) {
      this.notificationsMenuTrigger.closeMenu();
    }
  }

  ngOnDestroy(): void {
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
  }
}
