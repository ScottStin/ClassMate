import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { first, Observable, Subscription } from 'rxjs';
import { EditUserDialogComponent } from 'src/app/components/edit-user-dialog/edit-user-dialog.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { screenSizeBreakpoints } from 'src/app/shared/config';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements OnInit, OnDestroy {
  currentUser: UserDTO | undefined;
  hideNavText = false;
  menuItems = menuItems;
  private subscription: Subscription | null;
  user$: Observable<{ user: UserDTO } | null>;
  profilePictureSrc =
    'https://www.pngfind.com/pngs/m/610-6104451_image-placeholder-png-user-profile-placeholder-image-png.png';
  breadCrumb: string | undefined = '';
  private readonly routerSubscription: Subscription | undefined;
  users$: Observable<UserDTO[]>;
  error: Error;

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.hideNavText =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
  }

  constructor(
    public readonly authStoreService: AuthStoreService,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    public dialog: MatDialog
  ) {
    this.routerSubscription = this.router.events.subscribe(() => {
      setTimeout(() => {
        const menuItem = this.menuItems.find(
          (obj) =>
            obj.routerLink.replace(/\//gu, '') ===
            `${this.router.url}`.replace(/\//gu, '')
        );
        this.breadCrumb = menuItem?.name;
      }, 0);
    }); // todo = move routerSubscription to service
  }

  ngOnInit(): void {
    this.users$ = this.userService.users$;
    this.user$ = this.authStoreService.user$;
    this.getCurrentUser();
    this.hideNavText =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
  }

  getCurrentUser(): void {
    this.subscription = this.user$.subscribe((user) => {
      if (user) {
        this.currentUser = user.user;
        if (user.user.profilePicture) {
          this.profilePictureSrc = user.user.profilePicture.url.replace(
            '/upload',
            '/upload/w_900,h_900,c_thumb,c_crop,g_face'
          );
        }
      }
    });
  }

  openEditUserDialog(): void {
    let existingUsers;
    this.users$.pipe(first()).subscribe((res) => {
      existingUsers = res;
    });
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      data: {
        title: `Edit your details`,
        user: this.currentUser,
        existingUsers,
      },
    });
    dialogRef.afterClosed().subscribe((result: UserDTO | undefined) => {
      if (result) {
        this.userService.update(result, this.currentUser!._id!).subscribe({
          next: () => {
            this.snackbarService.open(
              'info',
              'Your profile has successfully been updated'
            );
            this.getCurrentUser();
          },
          error: (error: Error) => {
            this.error = error;
            this.snackbarService.openPermanent('error', error.message);
          },
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}

export const menuItems: MenuItemDTO[] = [
  // todo - move into seperate component
  {
    name: 'Home Page',
    use: ['student', 'teacher'],
    icon: 'home',
    routerLink: '/home',
  },
  {
    name: 'My Classes',
    use: ['student', 'teacher'],
    icon: 'class',
    routerLink: '/lessons',
    searchBar: 'Search your lessons...',
    headerButton: 'Add New Lesson',
    headerButtonIcon: 'add',
    headerButtonFunction: 'addNewLesson',
  },
  {
    name: 'My Exams',
    use: ['student'],
    icon: 'assignment',
    routerLink: '/exams',
  },
  { name: 'My Coursework', icon: 'work', use: ['Student'], routerLink: '' },
  {
    name: 'My Homework',
    use: ['student'],
    icon: 'assignment',
    routerLink: '',
  },
  {
    name: 'My Teachers',
    icon: 'school',
    use: ['student'],
    routerLink: '/users/teachers',
    searchBar: 'Search for a teacher...',
  },
  {
    name: 'My Classmates',
    use: ['student'],
    icon: 'group',
    routerLink: '/users/classmates',
    searchBar: 'Search for a class mate...',
  },
  {
    name: 'My Certificates',
    icon: 'grade',
    use: ['student'],
    routerLink: '',
  },
  {
    name: 'My Students',
    icon: 'child_care',
    use: ['teacher'],
    routerLink: '/users/students',
    searchBar: 'Search for a student...',
    headerButton: 'Add New Student',
    headerButtonIcon: 'add',
    headerButtonFunction: 'addNewStudent',
  },
  {
    name: 'My Colleagues',
    use: ['teacher'],
    icon: 'group',
    routerLink: '/users/colleagues',
    searchBar: 'Search for a colleague...',
    headerButton: 'Add New Teacher',
    headerButtonIcon: 'add',
    headerButtonFunction: 'addNewTeacher',
  },
  {
    name: 'My Messages',
    use: ['teacher', 'student'],
    icon: 'question_answer',
    routerLink: '',
  },
  {
    name: 'My Announcements',
    icon: 'speaker_notes',
    use: ['teacher', 'student'],
    routerLink: '',
  },
  {
    name: 'Class Material',
    use: ['teacher'],
    icon: 'notes',
    routerLink: '',
  },
  {
    name: 'Exam Marking',
    use: ['teacher'],
    icon: 'assignment',
    routerLink: '/exams',
  },
  {
    name: 'My Packages',
    use: ['student'],
    icon: 'group_work',
    routerLink: '/packages',
  },
  {
    name: 'Packages',
    use: ['teacher'],
    icon: 'group_work',
    routerLink: '/packages',
  },
  {
    name: 'My School',
    icon: 'location_city',
    use: ['student', 'teacher'],
    routerLink: '',
  },
  {
    name: 'Administration',
    icon: 'settings',
    use: ['admin', 'teacher'],
    routerLink: '',
  },
];

export interface MenuItemDTO {
  name: string;
  icon: string;
  use: string[];
  routerLink: string;
  searchBar?: string;
  headerButton?: string;
  headerButtonIcon?: string;
  headerButtonFunction?: string;
}
