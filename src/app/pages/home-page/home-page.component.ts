import { Component, HostListener, OnInit } from '@angular/core';
import { first, Observable } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { screenSizeBreakpoints } from 'src/app/shared/config';
import { demoLessons, demoLessonTypes } from 'src/app/shared/demo-data';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  mediumScreen = false;
  demoLessons = demoLessons;
  demoLessonTypes = demoLessonTypes;
  users$!: Observable<UserDTO[]>;
  usersLoading = true;

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.mediumScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.medium, 10);
  }

  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    this.getUsers();
    this.mediumScreen =
      window.innerWidth < parseInt(screenSizeBreakpoints.small, 10);
  }

  getUsers(): void {
    this.usersLoading = true;
    this.users$ = this.userService.users$;
    this.userService.getAll().subscribe({
      next: () => {
        this.usersLoading = false;
      },
      error: (error: Error) => {
        const snackbar = this.snackbarService.openPermanent(
          'error',
          'Error: Failed to load page.',
          'retry'
        );
        console.log(error);
        snackbar
          .onAction()
          .pipe(first())
          .subscribe(() => {
            this.getUsers();
          });
      },
    });
  }
}
