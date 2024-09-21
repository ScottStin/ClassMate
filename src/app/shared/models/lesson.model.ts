/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { LevelDTO, UserDTO } from './user.model';

export interface LessonDTO {
  _id?: string;
  teacher: UserDTO | string;
  schoolId: string;
  type: LessonTypeDTO;
  startTime: string;
  duration: number;
  level: LevelDTO[];
  name: string;
  description: string;
  casualPrice: number;
  maxStudents: number;
  studentsEnrolled: string[];
  disableFirtsLesson: boolean;
  status?: string; // todo: replace with enum 'started', 'finished' etc.
}

export interface LessonTypeDTO {
  name: string;
  shortName: string;
}
