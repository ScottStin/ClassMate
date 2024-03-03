/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
export interface SchoolDTO {
  _id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  nationality: string;
  description: string;
  hasedPassword?: string | null;
  unhashedPassword?: string | null;
  logo?: {
    url: string;
    filename: string;
  } | null;
  backgroundImage: {
    name: string;
    label: string;
    shadow: string;
  };
  primaryButtonBackgroundColor: string;
  primaryButtonTextColor: string;
  lessonTypes: {name: string; shortName: string}[];
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export type SchoolLoginDTO = Pick<SchoolDTO, 'email' | 'unhashedPassword'>;
