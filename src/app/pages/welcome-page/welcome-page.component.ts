import { Component } from '@angular/core';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.css'],
})
export class WelcomePageComponent {
  imageCards = [
    {
      source: '../../../assets/Student.png',
      route: '/home',
      title: 'Student',
    },
    {
      source: '../../../assets/Teacher.png',
      route: '/teacher/login',
      title: 'Teacher',
    },
    {
      source: '../../../assets/School.png',
      route: '/school/login',
      title: 'School',
    },
  ];

  hoveredElementIndex: number | null = null;
  isAnyElementHovered = false;

  setHoveredElement(index: number | null): void {
    this.hoveredElementIndex = index;
    this.isAnyElementHovered = index !== null;
  }
}
