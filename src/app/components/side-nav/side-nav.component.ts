import {
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { EditUserDialogComponent } from 'src/app/components/edit-user-dialog/edit-user-dialog.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { ExamService } from 'src/app/services/exam-service/exam.service';
import { QuestionService } from 'src/app/services/question-service/question.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { screenSizeBreakpoints } from 'src/app/shared/config';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements OnInit, OnDestroy, OnChanges {
  @Input() currentSchool: SchoolDTO | null;
  @Input() currentUser: UserDTO | null;
  @Input() users: UserDTO[] | null;
  @Input() pageStyles: {
    primaryButtonBackgroundColor: string;
    primaryButtonTextColor: string;
  };

  hideNavText = false;
  menuItems = menuItems;
  profilePictureSrc =
    'https://www.pngfind.com/pngs/m/610-6104451_image-placeholder-png-user-profile-placeholder-image-png.png';
  breadCrumb: string | undefined = '';
  private readonly routerSubscription: Subscription | undefined;
  feedbackSubmitted$: Observable<undefined>;
  error: Error;
  badgeCounts: Record<string, number | null | undefined> = {};

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
    private readonly examService: ExamService,
    private readonly questionService: QuestionService,
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

  async ngOnInit(): Promise<void> {
    this.getCurrentUserProfilePicture();
    this.hideNavText =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);

    this.badgeCounts['Exam Marking'] = await this.getBadgeNumber(
      'Exam Marking'
    );
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.questionService.feedbackSubmitted$.subscribe(async () => {
      this.badgeCounts['Exam Marking'] = await this.getBadgeNumber(
        'Exam Marking'
      );
    });
    this.addSchoolRoute();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('currentSchool' in changes) {
      this.addSchoolRoute();
    }
  }

  getCurrentUserProfilePicture(): void {
    if (this.currentUser?.profilePicture) {
      if (this.currentUser.userType.toLocaleLowerCase() !== 'school') {
        this.profilePictureSrc = this.currentUser.profilePicture.url.replace(
          '/upload',
          '/upload/w_900,h_900,c_thumb,c_crop,g_face'
        );
      } else {
        this.profilePictureSrc = this.currentUser.profilePicture.url;
      }
    }
  }

  openEditUserDialog(): void {
    const existingUsers = this.users;
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      data: {
        title: `Edit your details`,
        currentUser: this.currentUser,
        existingUsers,
      },
    });
    dialogRef.afterClosed().subscribe((result: UserDTO | undefined) => {
      if (
        result &&
        this.currentUser &&
        this.currentUser._id !== null &&
        this.currentUser._id !== undefined
      ) {
        this.userService
          .updateCurrentUser(
            {
              ...result,
              previousProfilePicture: this.currentUser.profilePicture,
            },
            this.currentUser._id
          )
          .subscribe({
            next: () => {
              this.snackbarService.open(
                'info',
                'Your profile has successfully been updated'
              );
              // this.getCurrentUser();

              // refresh lessons:
              // if (
              //   this.breadCrumb !== undefined &&
              //   [
              //     'home page',
              //     'my classes',
              //     'my teachers',
              //     'my classmates',
              //     'my students',
              //     'my colleague',
              //   ].includes(this.breadCrumb.toLowerCase())
              // ) {
              //   location.reload();
              // }
            },
            error: (error: Error) => {
              this.error = error;
              this.snackbarService.openPermanent('error', error.message);
            },
          });
      }
    });
  }

  async getBadgeNumber(menuItem: string): Promise<number | null | undefined> {
    if (menuItem === 'Exam Marking') {
      const exams = await this.examService.getAll().toPromise();
      let count = 0;

      exams?.forEach((exam) => {
        if (exam.assignedTeacher === this.currentUser?.email) {
          exam.studentsCompleted.forEach((student) => {
            if (student.mark === null) {
              count++;
            }
          });
        }
      });

      return count;
    } else {
      return null;
    }
  }

  addSchoolRoute(): void {
    if (this.currentSchool) {
      for (const menuItem of menuItems) {
        menuItem.routerLink = `/${this.currentSchool.name
          .replace(/ /gu, '-')
          .toLowerCase()}${menuItem.label}`;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}

export const menuItems: MenuItemDTO[] = [
  // todo - move into seperate component
  {
    name: 'Home Page',
    use: ['school', 'student', 'teacher'],
    icon: 'home',
    label: '/home',
    routerLink: '/home',
    breadcrumb: 'home',
  },
  {
    name: 'My Classes',
    adminName: 'Class',
    use: ['student', 'teacher', 'school'],
    icon: 'class',
    routerLink: '/lessons',
    searchBar: 'Search your lessons...',
    headerButton: 'Add New Lesson',
    headerButtonIcon: 'add',
    label: '/lessons',
    headerButtonFunction: 'addNewLesson',
    breadcrumb: 'lessons',
  },
  {
    name: 'My Exams',
    use: ['student'],
    icon: 'assignment',
    routerLink: '/exams',
    label: '/exams',
    searchBar: 'Search exams...',
    headerButton: 'Add New Exam',
    headerButtonIcon: 'add',
    breadcrumb: 'exams',
  },
  {
    name: 'My Coursework',
    icon: 'work',
    use: ['Student'],
    routerLink: '',
    label: '',
    breadcrumb: 'course work',
  },
  {
    name: 'My Homework',
    use: ['student'],
    icon: 'assignment',
    label: '',
    routerLink: '',
    breadcrumb: 'homework',
  },
  {
    name: 'My Teachers',
    icon: 'school',
    use: ['student'],
    routerLink: '/users/teachers',
    label: '/users/teachers',
    searchBar: 'Search for a teacher...',
    breadcrumb: 'teachers',
    headerButton: 'Add New Teacher',
    headerButtonIcon: 'add',
    headerButtonFunction: 'addNewTeacher',
  },
  {
    name: 'My Classmates',
    use: ['student'],
    icon: 'group',
    routerLink: '/users/classmates',
    label: '/users/classmates',
    searchBar: 'Search for a class mate...',
    breadcrumb: 'class mates',
  },
  {
    name: 'My Certificates',
    icon: 'grade',
    use: ['student'],
    routerLink: '',
    label: '',
    breadcrumb: 'certificates',
  },
  {
    name: 'My Students',
    adminName: 'Students',
    icon: 'child_care',
    use: ['school', 'teacher'],
    routerLink: '/users/students',
    label: '/users/students',
    searchBar: 'Search for a student...',
    headerButton: 'Add New Student',
    headerButtonIcon: 'add',
    headerButtonFunction: 'addNewStudent',
    breadcrumb: 'students',
  },
  {
    name: 'My Colleagues',
    adminName: 'Teachers',
    use: ['school', 'teacher'],
    icon: 'group',
    routerLink: '/users/colleagues',
    label: '/users/colleagues',
    searchBar: 'Search for a colleague...',
    headerButton: 'Add New Teacher',
    headerButtonIcon: 'add',
    headerButtonFunction: 'addNewTeacher',
    breadcrumb: 'colleagues',
  },
  {
    name: 'My Messages',
    use: ['teacher', 'student'],
    icon: 'question_answer',
    routerLink: '',
    label: '',
    breadcrumb: 'messages',
  },
  {
    name: 'My Announcements',
    icon: 'speaker_notes',
    use: ['teacher', 'student'],
    routerLink: '',
    label: '',
    breadcrumb: 'announcements',
  },
  {
    name: 'Class Material',
    use: ['school', 'teacher'],
    icon: 'notes',
    routerLink: '',
    label: '',
    breadcrumb: 'material',
  },
  {
    name: 'Exam Marking',
    adminName: 'Exams',
    use: ['school', 'teacher'],
    badge: 'getMarkPendingList',
    icon: 'assignment',
    routerLink: '/exams',
    label: '/exams',
    breadcrumb: 'exam marking',
  },
  {
    name: 'My Packages',
    use: ['student'],
    icon: 'group_work',
    routerLink: '/packages',
    label: '/packages',
    breadcrumb: 'my packages',
  },
  {
    name: 'Packages',
    use: ['school', 'teacher'],
    icon: 'group_work',
    routerLink: '/packages',
    label: '/packages',
    breadcrumb: 'packages',
  },
  {
    name: 'My School',
    icon: 'location_city',
    use: ['school', 'student', 'teacher'],
    routerLink: '',
    label: '',
    breadcrumb: 'school',
  },
  {
    name: 'Administration',
    icon: 'settings',
    use: ['school', 'teacher'],
    routerLink: '/admin',
    label: '/admin',
    breadcrumb: 'admin',
  },
];

export interface MenuItemDTO {
  name: string;
  adminName?: string;
  icon: string;
  use: string[];
  routerLink: string;
  badge?: string; // () => unknown; // number; // () => unknown;
  searchBar?: string;
  headerButton?: string;
  headerButtonIcon?: string;
  headerButtonFunction?: string;
  label: string;
  breadcrumb: string;
}
