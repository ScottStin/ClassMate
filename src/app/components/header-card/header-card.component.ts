import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { MenuItemDTO, menuItems } from '../side-nav/side-nav.component';

@Component({
  selector: 'app-header-card',
  templateUrl: './header-card.component.html',
  styleUrls: ['./header-card.component.css'],
})
export class HeaderCardComponent implements OnInit {
  @Output() closeSideNav = new EventEmitter();
  @Output() headerButtonAction = new EventEmitter();
  @Output() filterResults = new EventEmitter<string>();
  @Input() currentSchool: SchoolDTO | null;
  @Input() currentUser: UserDTO | null;
  @Input() pageName: string;
  @Input() pageStyles: {
    primaryButtonBackgroundColor: string;
    primaryButtonTextColor: string;
  };
  breadCrumb: string | undefined = '';
  searchBar: string | undefined = '';
  icon: string | undefined = '';
  headerButton: string | undefined = '';
  headerButtonIcon: string | undefined = '';
  headerButtonFunction: string | undefined = '';
  menuItems: MenuItemDTO[] = menuItems;

  constructor(
    public readonly authStoreService: AuthStoreService,
    public dialog: MatDialog,
    public snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
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

  logout(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Logout',
        message: 'Are you sure you want to logout?',
        okLabel: 'Logout',
        cancelLabel: 'Cancel',
        routerLink:
          this.currentSchool !== null
            ? `${this.currentSchool.name
                .replace(/ /gu, '-')
                .toLowerCase()}/welcome`
            : 'welcome',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        let firstName = 'mate';
        if (this.currentUser) {
          firstName = this.currentUser.name.split(' ')[0];
        }
        this.snackbarService.open('info', `Goodbye, ${firstName}!`);
        this.authStoreService.logout();
      }
    });
  }

  filterResultsKeyup(text: string): void {
    this.filterResults.emit(text);
  }
}
