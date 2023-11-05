import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { UserDTO } from 'src/app/shared/models/user.model';

import { MenuItemDTO, menuItems } from '../side-nav/side-nav.component';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css'],
})
export class UserCardComponent implements OnInit, OnDestroy {
  @Input() user: UserDTO;
  @Input() userType: string;

  profilePictureSrc =
    'https://www.pngfind.com/pngs/m/610-6104451_image-placeholder-png-user-profile-placeholder-image-png.png';
  menuItems: MenuItemDTO[] = menuItems;
  private readonly routerSubscription: Subscription | undefined;

  constructor(public readonly authStoreService: AuthStoreService) {}

  ngOnInit(): void {
    console.log(this.authStoreService.user$);
    if (this.user.profilePicture) {
      this.profilePictureSrc = this.user.profilePicture.url.replace(
        '/upload',
        '/upload/w_900,h_900,c_thumb,'
      );
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
