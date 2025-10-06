import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { CreateExamQuestionDto } from 'src/app/shared/models/question.model';
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
    private readonly errorService: ErrorService,
    private readonly socket: Socket
  ) {
    const currentSchoolString = localStorage.getItem('current_school');

    if (currentSchoolString !== null) {
      this.currentSchoolString = JSON.parse(currentSchoolString) as
        | SchoolDTO
        | undefined;
    }
    const currentSchool = this.currentSchoolString;
    if (currentSchool) {
      this.socket.on(
        `examEvent-${currentSchool._id}`,
        (event: { data: ExamDTO; action: string }) => {
          if (event.action === 'examCreated') {
            this.refreshExams(event.data);
          }

          if (event.action === 'examDeleted') {
            this.removeExam(event.data);
          }

          if (event.action === 'examUpdated') {
            this.updateExams(event.data);
          }
        }
      );
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

  getAllBySchoolId(currentSchoolId: string): Observable<ExamDTO[]> {
    return this.httpClient
      .get<ExamDTO[]>(`${this.baseUrl}?currentSchoolId=${currentSchoolId}`)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to load exams');
        }),
        tap((exams) => {
          this.examSubject.next(exams);
        })
      );
  }

  create(
    exam: ExamDTO,
    questions: CreateExamQuestionDto[]
  ): Observable<ExamDTO> {
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
      .patch<ExamDTO>(`${this.baseUrl}/register/${exam._id}`, student)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to sign up for exam');
        })
      );
  }

  resetStudentExam(examId: string, studentId: string): Observable<ExamDTO> {
    return this.httpClient
      .patch<ExamDTO>(`${this.baseUrl}/reset-student-exam/${examId}`, {
        studentId,
      })
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to reset exam');
        })
      );
  }

  enrolStudentsInExam(data: {
    exam: ExamDTO;
    studentIds: string[];
  }): Observable<ExamDTO> {
    return this.httpClient
      .patch<ExamDTO>(`${this.baseUrl}/enrol-students/${data.exam._id}`, data)
      .pipe(
        catchError((error: Error) => {
          this.handleError(error, 'Failed to enrol students in exam');
        })
      );
  }

  delete(data: ExamDTO): Observable<ExamDTO> {
    return (
      this.httpClient
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .delete<ExamDTO>(`${this.baseUrl}/${data._id}`)
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

  // --- Socket functions:

  refreshExams(newExam: ExamDTO): void {
    const currentExams = this.examSubject.value;
    this.examSubject.next([...currentExams, newExam]);
  }

  private updateExams(updatedExam: ExamDTO): void {
    const currentExams = this.examSubject.value;
    // eslint-disable-next-line no-confusing-arrow
    const updatedExams = currentExams.map((exam) =>
      exam._id === updatedExam._id ? updatedExam : exam
    );
    this.examSubject.next(updatedExams);
  }

  removeExam(deletedExam: ExamDTO): void {
    const currentExams = this.examSubject.value;
    const updatedExams = currentExams.filter(
      (exam) => exam._id !== deletedExam._id
    );
    this.examSubject.next(updatedExams);
  }
}
