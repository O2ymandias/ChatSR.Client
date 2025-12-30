import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import {
  AuthResponse,
  JwtPayload,
  LoginUserRequest,
  RegisterUserRequest,
} from '../../shared/models/auth.model';
import { environment } from '../../environment';
import { tap } from 'rxjs';
import { ApiResponse } from '../../shared/models/shared.model';
import { isPlatformBrowser } from '@angular/common';
import { ChatHubService } from './chat-hub-service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _chatHubService = inject(ChatHubService);
  private readonly _httpClient = inject(HttpClient);
  private readonly _platformId = inject(PLATFORM_ID);

  constructor() {
    if (!isPlatformBrowser(this._platformId)) return;

    const token = localStorage.getItem('token');
    const expiresOn = localStorage.getItem('expiresOn');

    if (!token || !expiresOn) return;

    this.token.set(token);
    this.tokenExpiresOn.set(new Date(expiresOn));
  }

  token = signal<string | null>(null);
  tokenExpiresOn = signal<Date | null>(null);

  isAuthenticated = computed(() => {
    const token = this.token();
    const expiresOn = this.tokenExpiresOn();
    if (!token || !expiresOn) return false;

    return new Date() < expiresOn;
  });

  userInfo = computed(() => {
    const token = this.token();
    if (!token) return null;
    return jwtDecode<JwtPayload>(token);
  });

  login(request: LoginUserRequest) {
    return this._httpClient
      .post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap((res) => {
          if (res.isSuccess && res.data) {
            const { token, expiresOn } = res.data;
            this.token.set(token);
            this.tokenExpiresOn.set(new Date(expiresOn));
            this.persistToken();
            this._chatHubService.startConnection(token);
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
            this.tokenExpiresOn.set(new Date(expiresOn));
            this.persistToken();
            this._chatHubService.startConnection(token);
          }
        }),
      );
  }

  persistToken() {
    const token = this.token();
    const expiresOn = this.tokenExpiresOn();
    if (token && expiresOn) {
      localStorage.setItem('token', token);
      localStorage.setItem('expiresOn', expiresOn.toISOString());
    }
  }

  logout() {
    this.token.set(null);
    this.tokenExpiresOn.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expiresOn');
    this._chatHubService.stopConnection();
  }
}
