import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { QuestionList } from 'src/app/components/create-exam-dialog/create-exam-dialog.component';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { SchoolDTO } from 'src/app/shared/models/school.model';
import { UserDTO } from 'src/app/shared/models/user.model';
import { environment } from 'src/environments/environment';

import { ErrorService } from '../error-message.service/error-message.service';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private readonly baseUrl = `${environment.apiUrl}/exams`;
  private readonly examSubject = new BehaviorSubject<ExamDTO[]>([]);
  exams$ = this.examSubject.asObservable();
  currentSchoolString: SchoolDTO | undefined;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly errorService: ErrorService
  ) {
    const currentSchoolString = localStorage.getItem('current_school');

    if (currentSchoolString !== null) {
      this.currentSchoolString = JSON.parse(currentSchoolString) as
        | SchoolDTO
        | undefined;
    }
  }

  getAll(): Observable<ExamDTO[]> {
    return this.httpClient.get<ExamDTO[]>(`${this.baseUrl}`).pipe(
      catchError((error: Error) => {
        this.handleError(error, 'Failed to load exams');
      }),
      tap((exams) => {
        this.examSubject.next(exams);
      })
    );
  }

  create(exam: ExamDTO, questions: QuestionList[]): Observable<ExamDTO> {
    //
    // add school id to exam data:
    const examData = {
      ...exam,
      schoolId: this.currentSchoolString?._id,
    };

    return this.httpClient
      .post<ExamDTO>(`${this.baseUrl}/new`, { examData, questions })
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to create new exam');
        })
      );
  }

  registerForExam(exam: ExamDTO, student: UserDTO): Observable<ExamDTO> {
    return this.httpClient
      .patch<ExamDTO>(`${this.baseUrl}/register/${exam._id!}`, student)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to sign up for exam');
        })
      );
  }

  // registerForDefaultExam(student: UserDTO): Observable<ExamDTO> {
  //   return this.httpClient
  //     .patch<ExamDTO>(`${this.baseUrl}/registerdefault`, student)
  //     .pipe(
  //       catchError((error: Error) => {
  //         this.handleError(error, 'Failed to sign up for default exam');
  //       })
  //     );
  // }

  delete(data: ExamDTO): Observable<ExamDTO> {
    return (
      this.httpClient
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .delete<ExamDTO>(`${this.baseUrl}/${data._id!}`)
        .pipe(
          catchError((error: Error) => {
            this.handleError(error, 'Failed to delete exam');
          })
        )
    );
  }

  private handleError(error: Error, message: string): never {
    if (error instanceof HttpErrorResponse) {
      throw this.errorService.handleHttpError(error);
    }
    throw this.errorService.handleGenericError(error, message);
  }
}
