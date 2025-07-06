import { ImageType } from 'src/app/services/file-service/file.service';

import { BackgroundImageDTO } from '../background-images';

export interface CreateSchoolDTO {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  nationality: string;
  description: string;
  unhashedPassword: string;
  logoPrimary: ImageType;
  logoSecondary: ImageType;
  backgroundImage: BackgroundImageDTO;
  primaryButtonBackgroundColor: string;
  primaryButtonTextColor: string;
  warnColor: string;
  errorColor: string;
  lessonTypes: { name: string; shortName: string }[];
}

export type SchoolDTO = Omit<CreateSchoolDTO, 'unhashedPassword'> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  hasedPassword?: string;
};

export type SchoolLoginDto = Pick<
  CreateSchoolDTO,
  'email' | 'unhashedPassword'
>;
