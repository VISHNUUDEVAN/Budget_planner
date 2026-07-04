import api from './client';
import type { LoginResponse } from '../types';

export const authApi = {
  signup: async (data: { fullName: string; email: string; mobileNumber?: string; password: string }) => {
    const res = await api.post<{ success: true; data: LoginResponse }>('/auth/signup', data);
    return res.data.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<{ success: true; data: LoginResponse }>('/auth/login', data);
    return res.data.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  verifyOTP: async (data: { email: string; otp: string }) => {
    const res = await api.post('/auth/verify-otp', data);
    return res.data;
  },

  resetPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },

  refreshToken: async (refreshToken: string) => {
    const res = await api.post<{ success: true; data: { accessToken: string; refreshToken: string } }>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return res.data.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};
