/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
export interface ExamDTO {
    _id?: string;
    name: string;
    studentsEnrolled: string[];
    studentsCompleted: string[];
    description: string;
    casualPrice: number;
    default: boolean;
    questions?: string[] | null;
    createdAt?: Date | null;
    assignedTeacher: string;
    autoMarking: boolean;
  }