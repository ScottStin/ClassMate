import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
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

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.hideNavText =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
  }

  constructor(public readonly authStoreService: AuthStoreService) {}

  ngOnInit(): void {
    this.user$ = this.authStoreService.user$;
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
    this.hideNavText =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

export const menuItems: MenuItemDTO[] = [
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
