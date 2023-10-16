import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { MenuItemDTO, menuItems } from '../side-nav/side-nav.component';

@Component({
  selector: 'app-header-card',
  templateUrl: './header-card.component.html',
  styleUrls: ['./header-card.component.css'],
})
export class HeaderCardComponent implements OnDestroy {
  @Output() closeSideNav = new EventEmitter();
  @Output() headerButtonAction = new EventEmitter();
  breadCrumb: string | undefined = '';
  searchBar: string | undefined = '';
  headerButton: string | undefined = '';
  headerButtonIcon: string | undefined = '';
  headerButtonFunction: string | undefined = '';
  menuItems: MenuItemDTO[] = menuItems;
  private readonly routerSubscription: Subscription | undefined;

  constructor(private readonly router: Router) {
    this.routerSubscription = this.router.events.subscribe(() => {
      setTimeout(() => {
        const urlAddress: string =
          this.router.url.split('/')[this.router.url.split('/').length - 1];
        const menuItem = this.menuItems.find(
          (obj) => obj.routerLink === `/${urlAddress}`
        );
        this.breadCrumb = menuItem?.name;
        this.searchBar = menuItem?.searchBar;
        this.headerButton = menuItem?.headerButton;
        this.headerButtonIcon = menuItem?.headerButtonIcon;
        this.headerButtonFunction = menuItem?.headerButtonFunction;
      }, 0);
    });
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
}
