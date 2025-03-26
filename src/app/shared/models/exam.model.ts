export interface ExamDTO {
  _id: string;
  name: string;
  studentsEnrolled: string[];
  studentsCompleted: { studentId: string; mark?: string | number | null }[];
  totalPointsMin?: number | null;
  totalPointsMax?: number | null;
  description: string;
  instructions?: string | null;
  casualPrice: number;
  default: boolean;
  questions?: string[] | null;
  createdAt?: Date | null;
  assignedTeacherId: string;
  aiMarkingComplete?: { studentId: string }[];
  schoolId: string | null;
}
