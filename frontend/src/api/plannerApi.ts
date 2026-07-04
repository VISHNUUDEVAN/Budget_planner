import api from './client';
import type {
  VacationPlanResult,
  PurchaseVerdictResult,
  EmergencyFundResult,
  SavingsAnalysisResult,
} from '../types';

export const plannerApi = {
  planVacation: async (data: {
    destination: string;
    travelDate: string;
    days: number;
    people: number;
    budget: number;
    originCity?: string;
  }): Promise<VacationPlanResult> => {
    const res = await api.post<{ success: true; data: VacationPlanResult }>('/planner/vacation', data);
    return res.data.data;
  },

  planPurchase: async (data: {
    productName: string;
    productCategory: string;
    price: number;
    emiTenureMonths: number;
  }): Promise<PurchaseVerdictResult> => {
    const res = await api.post<{ success: true; data: PurchaseVerdictResult }>('/planner/purchase', data);
    return res.data.data;
  },

  checkEmergencyFund: async (data: { requestedAmount: number }): Promise<EmergencyFundResult> => {
    const res = await api.post<{ success: true; data: EmergencyFundResult }>('/planner/emergency-fund', data);
    return res.data.data;
  },

  getSavingsAnalysis: async (): Promise<SavingsAnalysisResult> => {
    const res = await api.get<{ success: true; data: SavingsAnalysisResult }>('/planner/savings-analysis');
    return res.data.data;
  },
};
