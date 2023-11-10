/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
export interface UserDTO {
  _id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  nationality: string;
  userType: string;
  package: string;
  statement?: string | null;
  hasedPassword?: string | null;
  unhashedPassword?: string | null;
  profilePicture?: {
    url: string;
    filename: string;
  } | null;
  level?: LevelDTO;
  schoolId: number | string; // replace with number only
  eltComplete: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface LevelDTO {level: "A1 Beginner" | "A2 Lower-Intermediate" | "B1 Intermediate" | "B2 Upper-Intermediate" | "C1 Advanced" | "C2 Native" | null}

export type UserLoginDTO = Pick<UserDTO, 'email' | 'unhashedPassword'>