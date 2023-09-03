import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    // Check if the token exists and is not expired
    const token = this.getToken();
    if (token !== null) {
      const tokenData: TokenData = this.decodeToken(token) as TokenData;
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      const currentTime = Date.now() / 1000; // Convert to seconds
      // eslint-disable-next-line no-eq-null,, @typescript-eslint/no-unnecessary-condition
      return tokenData?.exp !== null && tokenData.exp > currentTime;
    }
    return false;
  }

  public decodeToken(token: string): any {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1])) as TokenData;
      return decodedToken;
    } catch (error) {
      return null;
    }
  }
}

interface TokenData {
  exp: number;
  [key: string]: any;
}
