import api from './client';
import type { User, FinancialProfile } from '../types';

export const profileApi = {
  getProfile: async (): Promise<User> => {
    const res = await api.get<{ success: true; data: { user: User } }>('/profile');
    return res.data.data.user;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await api.put<{ success: true; data: { user: User } }>('/profile', data);
    return res.data.data.user;
  },

  getFinancialDetails: async (): Promise<FinancialProfile> => {
    const res = await api.get<{ success: true; data: { financialProfile: FinancialProfile } }>('/profile/financial-details');
    return res.data.data.financialProfile;
  },

  updateFinancialDetails: async (data: Partial<FinancialProfile>): Promise<FinancialProfile> => {
    const res = await api.put<{ success: true; data: { financialProfile: FinancialProfile } }>('/profile/financial-details', data);
    return res.data.data.financialProfile;
  },

  changePassword: async (data: any): Promise<void> => {
    await api.put('/profile/change-password', data);
  },
};
