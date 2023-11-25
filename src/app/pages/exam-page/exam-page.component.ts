import { Component, OnInit, ViewChild } from '@angular/core';
import { ExamTableComponent } from 'src/app/components/exam-table/exam-table.component';
import { DemoExams } from 'src/app/shared/demo-data';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { UserDTO } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-exam-page',
  templateUrl: './exam-page.component.html',
  styleUrls: ['./exam-page.component.css'],
})
export class ExamPageComponent implements OnInit {
  @ViewChild(ExamTableComponent)
  examTableComponent: ExamTableComponent;

  examPageLoading = false;
  demoExams: ExamDTO[];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  currentUser = JSON.parse(localStorage.getItem('auth_data_token')!) as
    | { user: UserDTO }
    | undefined;

  // constructor() {}

  ngOnInit(): void {
    this.getExams();
  }

  getExams(): void {
    this.examPageLoading = true;
    this.demoExams = DemoExams;
    this.examPageLoading = false;
  }

  createExam(): void {
    // eslint-disable-next-line no-console
    console.log('test');
  }

  filterResults(text: string): void {
    this.examTableComponent.filterResults(text);
  }

  getUserExams(tab: string): ExamDTO[] {
    if (
      tab === 'My Exams' &&
      this.currentUser?.user.userType.toLowerCase() === 'teacher'
    ) {
      const exams = this.demoExams.filter(
        (obj) => obj.assignedTeacher === this.currentUser?.user.email
      );
      return exams; // return exams where the current teacher is the assigned marker
    } else if (
      tab === 'My Exams' &&
      this.currentUser &&
      this.currentUser.user.userType.toLowerCase() === 'student'
    ) {
      const exams = this.demoExams.filter((obj) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        obj.studentsEnrolled.includes(this.currentUser!.user.email)
      );
      return exams; // return exams where the current student is enrolled
    } else {
      return this.demoExams; // return all exams
    }
  }

  openEditExamDialog(exam: ExamDTO): void {
    console.log(exam);
  }

  openConfirmDeleteDialog(exam: ExamDTO): void {
    console.log(exam);
  }
}
