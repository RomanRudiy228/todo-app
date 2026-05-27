import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.models';

export const ACCESS_TOKEN_LIFETIME_MINUTES = 60;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/api/auth';
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  readonly currentUser = signal<User | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(request: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request, { withCredentials: true }).pipe(
      tap(res => this.setSession(res))
    );
  }

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request, { withCredentials: true }).pipe(
      tap(res => this.setSession(res))
    );
  }

  refresh() {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
      tap(res => this.setSession(res))
    );
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearSession())
    );
  }

  loadCurrentUser() {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(tap(user => this.currentUser.set(user)));
  }

  ensureSession(): Observable<void> {
    this.restoreSession();
    if (this.isLoggedIn()) {
      return of(undefined);
    }
    return this.refresh().pipe(map(() => undefined));
  }

  getAccessToken(): string | null {
    if (this.accessToken && this.tokenExpiry) {
      if (this.tokenExpiry > new Date()) {
        return this.accessToken;
      }
    }

    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  private setSession(response: AuthResponse) {
    this.accessToken = response.accessToken;
    this.tokenExpiry = this.expiryFromAccessToken(response.accessToken);
    sessionStorage.setItem('access_token', response.accessToken);
    sessionStorage.setItem('token_expiry', this.tokenExpiry.toISOString());
  }

  restoreSession() {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      return;
    }
    this.accessToken = token;
    const storedExpiry = sessionStorage.getItem('token_expiry');
    const jwtExpiry = this.expiryFromAccessToken(token);
    if (storedExpiry) {
      const parsed = new Date(storedExpiry);
      this.tokenExpiry = Number.isNaN(parsed.getTime()) ? jwtExpiry : parsed;
    } else {
      this.tokenExpiry = jwtExpiry;
    }
    sessionStorage.setItem('token_expiry', this.tokenExpiry.toISOString());
  }

  clearSession() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.currentUser.set(null);
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('token_expiry');
    this.router.navigate(['/login']);
  }

  private decodeJwtExpSeconds(accessToken: string): number | null {
    try {
      const payload = accessToken.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      const { exp } = JSON.parse(json) as { exp: number };
      return typeof exp === 'number' ? exp : null;
    } catch {
      return null;
    }
  }

  private expiryFromAccessToken(accessToken: string): Date {
    try {
      const expSeconds = this.decodeJwtExpSeconds(accessToken);
      if (expSeconds) {
        return new Date(expSeconds * 1000);
      }
    } catch {}

    return new Date(Date.now() + ACCESS_TOKEN_LIFETIME_MINUTES * 60 * 1000);
  }
}
