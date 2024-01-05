import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { first, Observable } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { UserService } from 'src/app/services/user-service/user.service';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-students-completed-exam-dialog',
  templateUrl: './students-completed-exam-dialog.component.html',
  styleUrls: ['./students-completed-exam-dialog.component.css'],
})
export class StudentsCompletedExamDialogComponent implements OnInit {
  exam: ExamDTO;
  usersLoading: boolean;
  users$: Observable<UserDTO[]>;
  studentNames: {
    name: string | undefined;
    email: string | undefined;
    marked: boolean | undefined;
  }[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { exam: ExamDTO },
    private readonly userService: UserService,
    private readonly snackbarService: SnackbarService
  ) {
    this.exam = data.exam;
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.usersLoading = true;
    this.users$ = this.userService.users$;
    this.userService.getAll().subscribe({
      next: (res) => {
        for (const student of this.exam.studentsCompleted) {
          const marked = false;
          this.studentNames.push({
            name: res.find((obj) => obj.email === student)?.name,
            email: res.find((obj) => obj.email === student)?.email,
            marked,
          });
        }
        this.usersLoading = false;
      },
      error: (error: Error) => {
        const snackbar = this.snackbarService.openPermanent(
          'error',
          'Error: Failed to load users.',
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

  // getStudentName(userEmail: string): string {
  //   let studentName: string | undefined = '';
  //   this.users$.pipe(first()).subscribe((res) => {
  //     studentName = res.find((obj) => obj.email === userEmail)?.name;
  //   });
  //   return studentName;
  // }
}
