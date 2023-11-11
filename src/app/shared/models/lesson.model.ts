/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { LevelDTO, UserDTO } from './user.model';

export interface LessonDTO {
  _id?: string;
  teacher: UserDTO | string;
  type: LessonTypeDTO;
  startTime: string;
  duration: number;
  level: LevelDTO[];
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
