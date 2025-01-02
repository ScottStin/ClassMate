export interface ExamDTO {
  _id?: string;
  name: string;
  studentsEnrolled: string[];
  // studentsCompleted: string[];
  studentsCompleted: { email: string; mark?: string | number | null }[];
  totalPointsMin?: number | null;
  totalPointsMax?: number | null;
  description: string;
  instructions?: string | null;
  casualPrice: number;
  default: boolean;
  questions?: string[] | null;
  createdAt?: Date | null;
  assignedTeacher: string;
  autoMarking: boolean;
  school: string | null;
}
