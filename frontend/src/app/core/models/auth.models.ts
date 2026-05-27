export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
}

export interface User {
  id: string;
  email: string;
  userName?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
