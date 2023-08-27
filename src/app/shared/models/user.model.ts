/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
export interface UserDTO {
  name: string;
  email: string;
  nationality: string;
  userType: string;
  package: string;
  teacherStatement?: string | null;
  hasedPassword?: string | null;
  unhashedPassword?: string | null;
  profilePicture?: string | null;
  level?: "A1 Beginner" | "A2 Lower-Intermediate" | "B1 Intermediate" | "B2 Upper-Intermediate" | "C1 Advanced" | "C2 Native" | null;
  schoolId: number;
  eltComplete: boolean;
}
