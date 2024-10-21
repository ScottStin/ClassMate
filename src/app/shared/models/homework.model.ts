export interface CreateHomeworkDTO {
  name: string;
  description: string;
  dueDate: string | null;
  assignedTeacherId: string;
  students: { studentId: string; completed: boolean }[];
  attachment: { url: string; fileName: string } | null;
  duration: number;
  comments?: CommentDTO[] | null;
  schoolId: string;
  createdAt?: string;
  // completed?: boolean;
  attempts?: number | null;
}

export interface HomeworkDTO extends CreateHomeworkDTO {
  _id: string;
}

export interface CommentDTO {
  _id?: string;
  teacherId?: string; // todo - remove undefined option;
  studentId: string;
  createdAt?: string;
  duration?: number;
  commentType: 'feedback' | 'submission';
  text: string;
  attachment: { url: string; fileName: string } | null;
  pass: boolean;
}
