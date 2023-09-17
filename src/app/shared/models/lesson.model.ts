/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { UserDTO } from './user.model';

export interface LessonDTO {
  teacher: UserDTO | string;
  type: LessonTypeDTO;
  startTime: string;
  duration: number;
  level: string[];
  name: string;
  description: string;
  casualPrice: number;
  maxStudents: number;
  studentsEnrolled: UserDTO[];
  disableFirtsLesson: boolean;
}

export interface LessonTypeDTO {
  name: string;
  shortName: string;
}
