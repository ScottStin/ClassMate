import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom, Observable, Subscription } from 'rxjs';
import { EditUserDialogComponent } from 'src/app/components/edit-user-dialog/edit-user-dialog.component';
import { AuthStoreService } from 'src/app/services/auth-store-service/auth-store.service';
import { ExamService } from 'src/app/services/exam-service/exam.service';
import { HomeworkService } from 'src/app/services/homework-service/homework.service';
import { QuestionService } from 'src/app/services/question-service/question.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import {
  TempStylesDTO,
  TempStylesService,
} from 'src/app/services/temp-styles-service/temp-styles-service.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { HomeworkDTO } from 'src/app/shared/models/homework.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements OnInit, OnDestroy, OnChanges {
  @Input() currentSchool: SchoolDTO | null;
  @Input() currentUser: UserDTO | null;
  @Input() users: UserDTO[] | null;
  @Input() sideNavOpen: boolean;

  menuItems = menuItems;
  profilePictureSrc =
    'https://www.pngfind.com/pngs/m/610-6104451_image-placeholder-png-user-profile-placeholder-image-png.png';
  breadCrumb: string | undefined = '';
  private readonly routerSubscription: Subscription | undefined;
  feedbackSubmitted$: Observable<undefined>;
  error: Error;
  badgeCounts: Record<string, number | null | undefined> = {};
  temporaryStyles$: Observable<TempStylesDTO | null>;
  homework$: Observable<HomeworkDTO[] | null>;

  // hideNavText = false;
  // @HostListener('window:resize', ['$event'])
  // onResize(): void {
  // this.hideNavText =
  //   window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
  // }

  constructor(
    public readonly authStoreService: AuthStoreService,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService,
    private readonly examService: ExamService,
    private readonly homeworkService: HomeworkService,
    private readonly questionService: QuestionService,
    public readonly tempStylesService: TempStylesService,
    public dialog: MatDialog
  ) {
    this.routerSubscription = this.router.events.subscribe(() => {
      setTimeout(() => {
        const menuItem = this.menuItems.find(
          (obj) =>
            obj.routerLink.replace(/\//gu, '') ===
            `${this.router.url}`.replace(/\//gu, '')
        );
        this.breadCrumb =
          this.currentUser?.userType.toLowerCase() === 'student'
            ? menuItem?.studentName
            : this.currentUser?.userType.toLowerCase() === 'school'
            ? menuItem?.adminName
            : this.currentUser?.userType.toLowerCase() === 'teacher'
            ? menuItem?.teacherName
            : '';
      }, 0);
    }); // todo = move routerSubscription to service
  }

  async ngOnInit(): Promise<void> {
    //
    // --- Load data:
    this.homework$ = this.homeworkService.homework$;
    this.homeworkService.getAll().pipe(untilDestroyed(this)).subscribe();
    this.getCurrentUserProfilePicture();

    // --- Init badge counts: ---
    this.badgeCounts['Exam Marking'] = await this.getBadgeNumber(
      'Exam Marking'
    );

    this.badgeCounts['Homework Marking'] = await this.getBadgeNumber(
      'Homework Marking'
    );

    this.badgeCounts['My Homework'] = await this.getBadgeNumber('My Homework');

    // --- Refresh badges: ---

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.questionService.feedbackSubmitted$.subscribe(async () => {
      this.badgeCounts['Exam Marking'] = await this.getBadgeNumber(
        'Exam Marking'
      );
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.homeworkService.commentSubmitted$.subscribe(async () => {
      this.badgeCounts['Homework Marking'] = await this.getBadgeNumber(
        'Homework Marking'
      );
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.homeworkService.commentSubmitted$.subscribe(async () => {
      this.badgeCounts['My Homework'] = await this.getBadgeNumber(
        'My Homework'
      );
    });

    // --- IO socket Live Data updates: ---
    this.homeworkService.homework$.pipe(untilDestroyed(this)).subscribe(() => {
      // eslint-disable-next-line no-void
      void this.getBadgeNumber('My Homework').then((badgeCount) => {
        this.badgeCounts['My Homework'] = badgeCount;
      });
    });

    this.homeworkService.homework$.pipe(untilDestroyed(this)).subscribe(() => {
      // eslint-disable-next-line no-void
      void this.getBadgeNumber('Homework Marking').then((badgeCount) => {
        this.badgeCounts['Homework Marking'] = badgeCount;
      });
    });

    this.temporaryStyles$ = this.tempStylesService.temporaryStyles$;
    this.addSchoolRoute();
    this.getTempStyles();
  }

  // todo - repalce with service, derective or helper:
  getTempStyles(): void {
    this.temporaryStyles$.pipe(untilDestroyed(this)).subscribe((tempStyles) => {
      if (tempStyles) {
        if (tempStyles.logo !== undefined) {
          this.profilePictureSrc = tempStyles.logo.url;
        }
      } else {
        this.getCurrentUserProfilePicture();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('currentSchool' in changes) {
      this.addSchoolRoute();
    }
  }

  getCurrentUserProfilePicture(): void {
    if (this.currentUser?.profilePicture) {
      if (this.currentUser.userType.toLowerCase() !== 'school') {
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
      if (result && this.currentUser) {
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
      const exams = await this.examService
        .getAllBySchoolId(this.currentSchool?._id ?? '')
        .toPromise();
      let count = 0;

      // todo - fix infinte loop when adding live data using methods below for homework
      exams?.forEach((exam) => {
        if (exam.assignedTeacherId === this.currentUser?._id) {
          exam.studentsCompleted.forEach((student) => {
            if (student.mark === null) {
              count++;
            }
          });
        }
      });

      return count;
    } else if (menuItem === 'Homework Marking') {
      const homework = await firstValueFrom(this.homeworkService.homework$);
      let count = 0;
      homework.forEach((homeworkItem) => {
        if (
          homeworkItem.assignedTeacherId === this.currentUser?._id &&
          homeworkItem.comments &&
          homeworkItem.comments.length > 0
        ) {
          const commentLength = homeworkItem.comments.length;
          if (
            homeworkItem.comments[commentLength - 1]?.commentType ===
            'submission'
          ) {
            count++;
          }
        }
      });
      return count;
    } else if (menuItem === 'My Homework') {
      const homework = await firstValueFrom(this.homeworkService.homework$);
      let count = 0;

      homework.forEach((homeworkItem) => {
        if (
          this.currentUser &&
          homeworkItem.students.some(
            (student) =>
              student.studentId === this.currentUser?._id && !student.completed
          )
        ) {
          count++;
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

  getMenuItemName(menuItem: MenuItemDTO): string {
    switch (this.currentUser?.userType.toLowerCase()) {
      case 'student':
        return menuItem.studentName ?? '';
      case 'teacher':
        return menuItem.teacherName ?? '';
      case 'school':
        return menuItem.adminName ?? '';
      default:
        return menuItem.studentName ?? '';
    }
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

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}

export const menuItems: MenuItemDTO[] = [
  // todo - move into seperate component
  {
    teacherName: 'Home',
    studentName: 'Home',
    adminName: 'Home',
    use: ['teacher', 'student', 'admin', 'school'],
    icon: 'home',
    label: '/home',
    routerLink: '/home',
    breadcrumb: 'home',
  },
  {
    teacherName: 'My Classes',
    studentName: 'My Classes',
    adminName: 'Classes',
    use: ['teacher', 'student', 'admin', 'school', 'school'],
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
    teacherName: 'Exam Marking',
    studentName: 'My Exams',
    adminName: 'Exams',
    use: ['teacher', 'student', 'admin', 'school'],
    icon: 'assignment',
    routerLink: '/exams',
    label: '/exams',
    searchBar: 'Search exams...',
    headerButton: 'Add New Exam',
    headerButtonIcon: 'add',
    breadcrumb: 'exams',
  },
  {
    teacherName: 'Coursework Marking',
    studentName: 'My Coursework',
    adminName: 'Coursework',
    use: ['teacher', 'student', 'admin', 'school'],
    icon: 'work',
    routerLink: '',
    label: '',
    breadcrumb: 'course work',
  },
  {
    teacherName: 'Homework Marking',
    studentName: 'My Homework',
    adminName: 'Homework',
    use: ['teacher', 'student', 'admin', 'school'],
    icon: 'library_books',
    searchBar: 'Search homework...',
    label: '/homework',
    routerLink: '/homework',
    breadcrumb: 'homework',
    headerButton: 'Add Homework Exercise',
    headerButtonIcon: 'add',
    headerButtonFunction: 'createHomework',
  },
  {
    studentName: 'My Teachers',
    icon: 'school',
    use: ['student'],
    routerLink: '/users/teachers',
    label: '/users/teachers',
    searchBar: 'Search for a teacher...',
    breadcrumb: 'teachers',
  },
  {
    studentName: 'My Classmates',
    use: ['student'],
    icon: 'groups',
    routerLink: '/users/classmates',
    label: '/users/classmates',
    searchBar: 'Search for a class mate...',
    breadcrumb: 'class mates',
  },
  {
    teacherName: 'My Students',
    adminName: 'Students',
    use: ['teacher', 'admin'],
    icon: 'groups',
    routerLink: '/users/students',
    label: '/users/students',
    searchBar: 'Search for a student...',
    headerButton: 'Add New Student',
    headerButtonIcon: 'add',
    headerButtonFunction: 'addNewStudent',
    breadcrumb: 'students',
  },
  {
    teacherName: 'My Colleagues',
    adminName: 'Teachers',
    use: ['teacher', 'admin'],
    icon: 'co_present',
    routerLink: '/users/colleagues',
    label: '/users/colleagues',
    searchBar: 'Search for a colleague...',
    headerButton: 'Add New Teacher',
    headerButtonIcon: 'add',
    headerButtonFunction: 'addNewTeacher',
    breadcrumb: 'colleagues',
  },
  // {
  //   teacherName: 'My Messages',
  //   studentName: 'My Messages',
  //   adminName: 'Messages',
  //   use: ['teacher', 'student', 'admin', 'school'],
  //   icon: 'question_answer',
  //   routerLink: '',
  //   label: '',
  //   breadcrumb: 'messages',
  // },
  // {
  //   teacherName: 'My Announcements',
  //   studentName: 'My Announcements',
  //   adminName: 'Announcements',
  //   use: ['teacher', 'student', 'admin', 'school'],
  //   icon: 'speaker_notes',
  //   routerLink: '',
  //   label: '',
  //   breadcrumb: 'announcements',
  // },
  {
    teacherName: 'Packages',
    studentName: 'My Packages',
    adminName: 'Packages',
    use: ['teacher', 'student', 'admin', 'school'],
    icon: 'group_work',
    routerLink: '/packages',
    label: '/packages',
    breadcrumb: 'my packages',
  },
  // {
  //   teacherName: 'My School',
  //   studentName: 'My School',
  //   adminName: 'School',
  //   use: ['teacher', 'student', 'admin', 'school'],
  //   icon: 'location_city',
  //   routerLink: '',
  //   label: '',
  //   breadcrumb: 'school',
  // },
  {
    adminName: 'Administration',
    use: ['admin', 'school'],
    icon: 'settings',
    routerLink: '/admin',
    label: '/admin',
    breadcrumb: 'admin',
  },
];

export interface MenuItemDTO {
  teacherName?: string;
  studentName?: string;
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
