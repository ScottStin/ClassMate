import { Component, HostListener, OnInit } from '@angular/core';
import { screenSizeBreakpoints } from 'src/app/shared/config';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements OnInit {
  currentUser: { userType: string } = { userType: 'student' };
  hideNavText = false;
  menuItems = menuItems;

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.hideNavText =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
  }

  ngOnInit(): void {
    this.hideNavText =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
  }
}

export const menuItems: MenuItemDTO[] = [
  {
    name: 'Home Page',
    use: ['student', 'Teacher'],
    icon: 'home',
    routerLink: '/home',
  },
  {
    name: 'My Classes',
    use: ['student', 'Teacher'],
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
  { name: 'My Coursework', icon: 'work', use: ['student'], routerLink: '' },
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
    routerLink: '/teacherlist',
  },
  {
    name: 'My Classmates',
    use: ['Student'],
    icon: 'group',
    routerLink: '/studentlist',
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
    use: ['Teacher'],
    routerLink: '/studentlist',
  },
  {
    name: 'My Colleagues',
    use: ['Teacher'],
    icon: 'group',
    routerLink: '/teacherlist',
  },
  {
    name: 'My Messages',
    use: ['Teacher', 'Student'],
    icon: 'question_answer',
    routerLink: '',
  },
  {
    name: 'My Announcements',
    icon: 'speaker_notes',
    use: ['Teacher', 'student'],
    routerLink: '',
  },
  {
    name: 'Class Material',
    use: ['Teacher'],
    icon: 'notes',
    routerLink: '',
  },
  {
    name: 'Exam Marking',
    use: ['Teacher'],
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
    use: ['Teacher'],
    icon: 'group_work',
    routerLink: '/packages',
  },
  {
    name: 'My School',
    icon: 'location_city',
    use: ['student', 'Teacher'],
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
