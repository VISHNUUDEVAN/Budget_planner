// ─── Auth ──────────────────────────────────────────────────
export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  address?: string;
  city?: string;
  occupation?: string;
  age?: number;
  lifestyleType?: LifestyleType;
  createdAt: string;
  updatedAt: string;
}

export type LifestyleType =
  | 'student'
  | 'family'
  | 'working_professional'
  | 'bachelor'
  | 'business_owner'
  | 'freelancer'
  | 'job_seeker'
  | 'retired';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── Financial Profile ────────────────────────────────────
export interface FinancialProfile {
  id: string;
  userId: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  existingLoansEMI: number;
  monthlySavingsGoal: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Transaction ──────────────────────────────────────────
export interface Transaction {
  id: string;
  userId: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  note?: string;
  createdAt: string;
}

// ─── Loan ─────────────────────────────────────────────────
export interface Loan {
  id: string;
  userId: string;
  loanName: string;
  principal: number;
  emiAmount: number;
  remainingTenureMonths: number;
  interestRate: number;
  createdAt: string;
}

// ─── Goal ─────────────────────────────────────────────────
export interface Goal {
  id: string;
  userId: string;
  goalType: 'vacation' | 'purchase' | 'emergency' | 'custom';
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  status: 'active' | 'completed' | 'paused';
  description?: string;
}

// ─── Notification ─────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'warning' | 'success' | 'info';
  read: boolean;
  createdAt: string;
}

// ─── Dashboard ────────────────────────────────────────────
export interface DashboardSummary {
  user: { fullName: string; lifestyleType: LifestyleType | null };
  summary: {
    monthlyIncome: number;
    monthlyExpenses: number;
    currentSavings: number;
    totalLoanAmount: number;
    totalEMI: number;
    savingsProgress: number;
    healthScore: number;
    healthGrade: string;
  };
  budgetSummary: {
    income: number;
    expenses: number;
    emi: number;
    savingsGoal: number;
    surplus: number;
  };
  expenseBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  recentTransactions: Transaction[];
  upcomingPayments: Array<{ id: string; name: string; amount: number; dueDate: string; type: string }>;
  activeGoals: Goal[];
}

export interface HealthScoreResult {
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    savingsRatio: { score: number; weight: number; value: number; label: string };
    expenseRatio: { score: number; weight: number; value: number; label: string };
    loanToIncomeRatio: { score: number; weight: number; value: number; label: string };
    emergencyFundAdequacy: { score: number; weight: number; value: number; label: string };
  };
  recommendations: string[];
}

// ─── Planner ──────────────────────────────────────────────
export interface VacationPlanResult {
  destination: string;
  days: number;
  people: number;
  userBudget: number;
  availableBudget: number;
  transportOptions: TransportOption[];
  hotelOptions: HotelOption[];
  combinations: VacationCostCombination[];
  recommendation: string;
  budgetFeasible: boolean;
}

export interface TransportOption {
  mode: 'bus' | 'train' | 'flight';
  costPerPerson: number;
  totalCost: number;
  estimatedHours: number;
  comfortLevel: 'budget' | 'standard' | 'premium';
  isBestValue?: boolean;
}

export interface HotelOption {
  tier: 'budget' | 'standard' | 'luxury';
  costPerNight: number;
  totalCost: number;
  amenities: string[];
}

export interface VacationCostCombination {
  transport: TransportOption;
  hotel: HotelOption;
  totalCost: number;
  costPerPerson: number;
  withinBudget: boolean;
  isBestValue?: boolean;
}

export interface PurchaseVerdictResult {
  recommended: boolean;
  reason: string;
  affordabilityScore: number;
  purchaseType: 'outright' | 'emi';
  emiAmount: number | null;
  emiToIncomeRatio: number | null;
  newTotalEMIRatio: number | null;
  emiSchedule: EMIScheduleEntry[];
  impactSummary: {
    emergencyFundImpact: string;
    monthlyCashFlowImpact: string;
    payoffPeriod: string;
  };
}

export interface EMIScheduleEntry {
  month: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

export interface EmergencyFundResult {
  requestedAmount: number;
  safeAmount: number;
  currentSavings: number;
  verdict: 'safe' | 'not_recommended';
  reasons: string[];
  breakdown: {
    totalSavings: number;
    emiBuffer: number;
    minimumEmergencyFund: number;
    availableForWithdrawal: number;
  };
}

export interface SavingsAnalysisResult {
  currentSavings: number;
  monthlySavingsCapacity: number;
  emergencyFundStatus: 'adequate' | 'partial' | 'insufficient';
  emergencyFundTarget: number;
  emergencyFundGap: number;
  projections: {
    months12: GrowthProjection[];
    months24: GrowthProjection[];
    months36: GrowthProjection[];
  };
  investmentSuggestions: InvestmentBucket[];
  summary: string;
}

export interface GrowthProjection {
  month: number;
  savings: number;
  label: string;
}

export interface InvestmentBucket {
  name: string;
  type: 'low_risk' | 'medium_risk' | 'high_risk';
  expectedAnnualReturn: number;
  description: string;
  suitableFor: string[];
  minimumAmount: number;
}

// ─── API Response wrapper ─────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: Array<{ field: string; message: string }> };
}
