import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.models';

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
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  getAccessToken(): string | null {
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
    this.tokenExpiry = new Date(response.expiresAt);
    sessionStorage.setItem('access_token', response.accessToken);
    sessionStorage.setItem('token_expiry', response.expiresAt);
  }

  restoreSession() {
    const token = sessionStorage.getItem('access_token');
    const expiry = sessionStorage.getItem('token_expiry');
    if (token && expiry) {
      this.accessToken = token;
      this.tokenExpiry = new Date(expiry);
    }
  }

  clearSession() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.currentUser.set(null);
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('token_expiry');
    this.router.navigate(['/login']);
  }
}
