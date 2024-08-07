/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
export interface HomeworkDTO {
  _id?: string;
  name: string;
  description: string;
  dueDate: string | null;
  assignedTeacher: string;
  students: {studentId: string; completed: boolean}[];
  attachment: { url: string; fileName: string } | null;
  duration: number;
  comments?: CommentDTO[] | null;
  schoolId: string;
  createdAt?: string;
  // completed?: boolean;
  attempts?: number | null;
}

export interface CommentDTO {
  _id?: string;
  teacher?: string;
  student: string;
  createdAt?: string;
  duration?: number;
  commentType: 'feedback' | 'submission';
  text: string;
  attachment: { url: string; fileName: string } | null;
  pass: boolean;
}
