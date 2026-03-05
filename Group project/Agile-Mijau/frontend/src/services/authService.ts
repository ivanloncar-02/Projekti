import { apiRequest } from './api';
import type { User, RegisterData } from '../types';

interface LoginResponse {
  access_token: string;
  user: User;
}

interface RegisterResponse {
  access_token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await apiRequest<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },
};
