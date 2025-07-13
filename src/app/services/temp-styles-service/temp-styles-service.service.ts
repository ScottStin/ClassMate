import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BackgroundImageDTO } from 'src/app/shared/background-images';

import { ImageType } from '../file-service/file.service';

@Injectable({
  providedIn: 'root',
})
export class TempStylesService {
  private readonly temporaryStylesSubject =
    new BehaviorSubject<TempStylesSubject>(null);

  temporaryStyles$: Observable<TempStylesSubject> =
    this.temporaryStylesSubject.asObservable();

  updateTemporaryStyles(style: TempStylesDTO | null): void {
    this.temporaryStylesSubject.next(style);
  }

  getBackgroundStyleStyle(
    selectedBackgroundImage: BackgroundImageType
  ): string {
    if (
      selectedBackgroundImage.type === 'pattern' ||
      !selectedBackgroundImage.type
    ) {
      return `background-image: url(../../../assets/${selectedBackgroundImage.name})`;
    }

    if (selectedBackgroundImage.type === 'color') {
      return `background: ${selectedBackgroundImage.name}`;
    }

    return `background-image: ${selectedBackgroundImage.name}`;
  }
}

export type TempStylesSubject = TempStylesDTO | null;

export interface TempStylesDTO {
  primaryButtonBackgroundColor?: string;
  primaryButtonTextColor?: string;
  backgroundColor?: BackgroundImageDTO | null;
  warnColor?: string;
  errorColor?: string;
  logoPrimary?: ImageType;
  logoSecondary?: ImageType;
}

export interface BackgroundImageType {
  name: string;
  label: string;
  shadow: string;
  type?: string;
}
