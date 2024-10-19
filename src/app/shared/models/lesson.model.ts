import { LevelDTO } from './user.model';

export interface CreateLessonDTO {
  teacherId: string;
  schoolId: string;
  type: LessonTypeDTO;
  startTime: string;
  duration: number;
  level: LevelDTO[];
  name: string;
  description: string;
  casualPrice: number;
  maxStudents: number;
  studentsEnrolledIds: string[];
  disableFirtsLesson: boolean;
  status?: string; // todo: replace with enum 'started', 'finished' etc.
}

export interface LessonDTO extends CreateLessonDTO {
  _id: string;
}

export interface LessonTypeDTO {
  name: string;
  shortName: string;
}
