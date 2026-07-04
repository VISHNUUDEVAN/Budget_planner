import api from './client';
import type { DashboardSummary, HealthScoreResult } from '../types';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await api.get<{ success: true; data: DashboardSummary }>('/dashboard/summary');
    return res.data.data;
  },

  getHealthScore: async (): Promise<HealthScoreResult> => {
    const res = await api.get<{ success: true; data: HealthScoreResult }>('/dashboard/health-score');
    return res.data.data;
  },
};
