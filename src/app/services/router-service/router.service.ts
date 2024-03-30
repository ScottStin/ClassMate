import { Injectable } from '@angular/core';
import { Router, Routes } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  constructor(private readonly router: Router) {}

  initialize(routes: Routes): void {
    try {
      this.router.resetConfig([...routes]);
    } catch (error) {
      console.error('Error initializing routes:', error);
    }
  }
}
