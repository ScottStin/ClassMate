/* eslint-disable prettier/prettier *//* eslint-disable linebreak-style */
import { BackgroundImageDTO } from '../background-images';

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
  backgroundImage: BackgroundImageDTO;
  primaryButtonBackgroundColor: string;
  primaryButtonTextColor: string;
  lessonTypes: { name: string; shortName: string }[];
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export type SchoolLoginDTO = Pick<SchoolDTO, 'email' | 'unhashedPassword'>;
