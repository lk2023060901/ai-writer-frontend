import { apiClient } from '@/utils/api';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user_id: string;
  email: string;
  message: string;
}

export interface LoginRequest {
  account: string;  // 邮箱或姓名
  password: string;
  remember_me?: boolean;  // true: 90天, false: 7天
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

export interface LoginResponseData {
  require_2fa: boolean;
  pending_auth_id?: string;
  tokens?: TokenResponse;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface Verify2FARequest {
  pending_auth_id: string;
  code: string;
}

export interface Verify2FAResponse {
  tokens: TokenResponse;
}

export const authService = {
  async register(data: RegisterRequest) {
    return apiClient.post<RegisterResponse>('/api/v1/auth/register', data);
  },

  async login(data: LoginRequest) {
    return apiClient.post<LoginResponseData>('/api/v1/auth/login', data);
  },

  async verify2FA(data: Verify2FARequest) {
    return apiClient.post<Verify2FAResponse>('/api/v1/auth/2fa/verify', data);
  },

  async refreshToken(refreshToken: string) {
    return apiClient.post<{ tokens: TokenResponse }>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
  },

  saveTokens(tokens: TokenResponse) {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem(
      'token_expires_at',
      (Date.now() + tokens.expires_in * 1000).toString()
    );
  },

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
  },

  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  isAuthenticated() {
    const token = this.getAccessToken();
    const expiresAt = localStorage.getItem('token_expires_at');

    if (!token || !expiresAt) {
      return false;
    }

    return Date.now() < parseInt(expiresAt);
  },
};
