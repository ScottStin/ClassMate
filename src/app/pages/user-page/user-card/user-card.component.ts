import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { UserDTO } from 'src/app/shared/models/user.model';

import { MenuItemDTO, menuItems } from '../../../components/side-nav/side-nav.component';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
})
export class UserCardComponent implements OnInit, OnDestroy {
  @Input() user?: UserDTO;
  @Input() userType?: string;
  @Output() openConfirmDeleteDialog = new EventEmitter<UserDTO>();
  @Output() openEditUserDialog = new EventEmitter<{
    user: UserDTO;
    formType: string | null;
  }>();

  profilePictureSrc =
    'https://www.pngfind.com/pngs/m/610-6104451_image-placeholder-png-user-profile-placeholder-image-png.png';
  menuItems: MenuItemDTO[] = menuItems;
  private readonly routerSubscription: Subscription | undefined;

  constructor(public readonly authStoreService: AuthStoreService) {}

  ngOnInit(): void {
    if (this.user?.profilePicture) {
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

  openConfirmDeleteDialogClick(user: UserDTO | undefined): void {
    this.openConfirmDeleteDialog.emit(user);
  }

  openEditUserDialogClick(user: UserDTO): void {
    this.openEditUserDialog.emit({
      user,
      formType: this.userType?.toLocaleLowerCase() ?? '',
    });
  }
}
