import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent {
  error!: Error;
  isFlipped = false;

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService
  ) {}

  async onCardFlipped(isFlipped: boolean): Promise<void> {
    this.isFlipped = isFlipped;
    if (!this.isFlipped) {
      await this.router.navigateByUrl('student/signup');
    } else {
      await this.router.navigateByUrl('student/login');
    }
  }

  signup(user: UserDTO): void {
    this.userService.create(user).subscribe({
      next: (res: UserDTO) => {
        let message = '';
        if (res.userType === 'student') {
          message = `Thank you for joining, ${res.name}. Remember, your first class is free. But before you join you need to complete your free English Level Test. Click on 'My Exams' to get started.`;
        }
        if (res.userType === 'Teacher') {
          message = `Thank you for joining, ${res.name}. Click the 'My Classes' tab to schedule your first lesson`;
        }
        this.snackbarService.open('info', message);
      },
      error: (error: Error) => {
        this.error = error;
        this.snackbarService.openPermanent('error', error.message);
      },
    });
  }
}
