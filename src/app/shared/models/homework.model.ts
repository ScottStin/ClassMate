/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
export interface HomeworkDTO {
  _id?: string;
  name: string;
  description: string;
  dueDate: string | null;
  assignedTeacher: string;
  students: string[];
  attachment: { url: string; fileName: string } | null;
  duration: number;
  comments?: CommentDTO[] | null;
  schoolId: string;
  createdAt?: string;
  completed?: boolean;
}

export interface CommentDTO {
  teacher?: string;
  student: string;
  createdAt?: string;
  duration?: number;
  commentType: 'feedback' | 'submission';
  text: string;
  attachment: { url: string; fileName: string } | null;
  pass: boolean;
}
