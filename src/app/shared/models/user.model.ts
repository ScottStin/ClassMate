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
  profilePicture?: ProfilePictureDTO | null;
  level?: LevelDTO | null;
  // level?: string | null;
  schoolId: number | string; // replace with number only
  eltComplete: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface ProfilePictureDTO {
  url: string;
  filename: string;
}

export interface LevelDTO {
  longName: string | null;
  shortName: string | null;
}

export type UserLoginDTO = Pick<UserDTO, 'email' | 'unhashedPassword'>;
