import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import {
  AuthResponse,
  LoginUserRequest,
  RegisterUserRequest,
} from '../../shared/models/auth.model';
import { environment } from '../../environment';
import { tap } from 'rxjs';
import { ApiResponse } from '../../shared/models/shared.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this._platformId)) {
      const token = localStorage.getItem('token');
      const expiresOn = localStorage.getItem('expiresOn');
      if (token && expiresOn) {
        this.token.set(token);
        this.tokenExpiresOn.set(new Date(expiresOn));
      }
    }
  }

  token = signal<string | null>(null);
  tokenExpiresOn = signal<Date | null>(null);

  login(request: LoginUserRequest) {
    return this._httpClient
      .post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap((res) => {
          if (res.isSuccess && res.data) {
            const { token, expiresOn } = res.data;
            this.token.set(token);
            this.tokenExpiresOn.set(expiresOn);
            this.persistToken();
          }
        }),
      );
  }

  register(request: RegisterUserRequest) {
    return this._httpClient
      .post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/register`, request)
      .pipe(
        tap((res) => {
          if (res.isSuccess && res.data) {
            const { token, expiresOn } = res.data;
            this.token.set(token);
            this.tokenExpiresOn.set(expiresOn);
            this.persistToken();
          }
        }),
      );
  }

  persistToken() {
    const token = this.token();
    const expiresOn = this.tokenExpiresOn();
    if (token && expiresOn) {
      localStorage.setItem('token', token);
      localStorage.setItem('expiresOn', expiresOn.toString());
    }
  }

  logout() {
    this.token.set(null);
    this.tokenExpiresOn.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expiresOn');
  }
}
