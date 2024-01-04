import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserDTO } from 'src/app/shared/models/user.model';

import { MenuItemDTO, menuItems } from '../side-nav/side-nav.component';

@Component({
  selector: 'app-header-card',
  templateUrl: './header-card.component.html',
  styleUrls: ['./header-card.component.css'],
})
export class HeaderCardComponent implements OnDestroy {
  @Output() closeSideNav = new EventEmitter();
  @Output() headerButtonAction = new EventEmitter();
  @Output() filterResults = new EventEmitter<string>();
  breadCrumb: string | undefined = '';
  searchBar: string | undefined = '';
  icon: string | undefined = '';
  headerButton: string | undefined = '';
  headerButtonIcon: string | undefined = '';
  headerButtonFunction: string | undefined = '';
  menuItems: MenuItemDTO[] = menuItems;
  private readonly routerSubscription: Subscription | undefined;

  currentUser = JSON.parse(localStorage.getItem('auth_data_token')!) as
    | { user: UserDTO }
    | undefined;

  constructor(
    private readonly router: Router,
    public readonly authStoreService: AuthStoreService,
    public dialog: MatDialog,
    public snackbarService: SnackbarService
  ) {
    this.routerSubscription = this.router.events.subscribe(() => {
      setTimeout(() => {
        // const urlAddress: string = this.router.url.split('/')[this.router.url.split('/').length - 1];
        const menuItem = this.menuItems.find(
          (obj) =>
            obj.routerLink.replace(/\//gu, '') ===
            `${this.router.url}`.replace(/\//gu, '') // `${urlAddress}`.replace(/\//gu, '')
        );
        this.breadCrumb = menuItem?.name;
        this.searchBar = menuItem?.searchBar;
        this.headerButton = menuItem?.headerButton;
        this.headerButtonIcon = menuItem?.headerButtonIcon;
        this.headerButtonFunction = menuItem?.headerButtonFunction;
        this.icon = menuItem?.icon;
      }, 0);
    }); // todo = move routerSubscription to service or replace with router data in route modules.
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  closeSideNavClick(): void {
    this.closeSideNav.emit();
  }

  headerButtonClick(): void {
    this.headerButtonAction.emit();
  }

  logout(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Logout',
        message: 'Are you sure you want to logout?',
        okLabel: 'Logout',
        cancelLabel: 'Cancel',
        routerLink: 'welcome',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        const firstName = (
          JSON.parse(localStorage.getItem('auth_data_token')!) as {
            user: UserDTO;
          }
        ).user.name.split(' ')[0];
        this.snackbarService.open('info', `Goodbye, ${firstName}!`);
        this.authStoreService.logout();
      }
    });
  }

  filterResultsKeyup(text: string): void {
    console.log(text);
    this.filterResults.emit(text);
  }
}
