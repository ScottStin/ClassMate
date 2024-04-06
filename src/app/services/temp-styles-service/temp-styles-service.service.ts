import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TempStylesService {
  private readonly temporaryStylesSubject =
    new BehaviorSubject<TempStylesSubject>(null);

  temporaryStyles$: Observable<TempStylesSubject> =
    this.temporaryStylesSubject.asObservable();

  // constructor() {}

  updateTemporaryStyles(style: TempStylesDTO | null): void {
    this.temporaryStylesSubject.next(style);
  }
}

export type TempStylesSubject = TempStylesDTO | null;

export interface TempStylesDTO {
  primaryButtonBackgroundColor?: string;
  primaryButtonTextColor?: string;
  backgroundType?: string;
  backgroundColor?: string;
}
