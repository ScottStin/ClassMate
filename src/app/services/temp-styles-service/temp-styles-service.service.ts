import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BackgroundImageDTO } from 'src/app/shared/background-images';

import { ImageType } from '../image-service/image.service';

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
