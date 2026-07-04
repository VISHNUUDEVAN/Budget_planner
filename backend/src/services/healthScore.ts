/**
 * Health Score Service
 *
 * Computes a 0-100 financial health score based on 4 weighted components:
 *  - Savings Ratio (30%): monthlySavings / monthlyIncome
 *  - Expense Ratio (25%): monthlyExpenses / monthlyIncome (lower = better)
 *  - Loan-to-Income Ratio (25%): totalEMI / monthlyIncome (lower = better)
 *  - Emergency Fund Adequacy (20%): currentSavings vs 3 months of expenses
 */

export interface HealthScoreBreakdown {
  savingsRatio: { score: number; weight: number; value: number; label: string };
  expenseRatio: { score: number; weight: number; value: number; label: string };
  loanToIncomeRatio: { score: number; weight: number; value: number; label: string };
  emergencyFundAdequacy: { score: number; weight: number; value: number; label: string };
}

export interface HealthScoreResult {
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: HealthScoreBreakdown;
  recommendations: string[];
}

export function computeHealthScore(profile: {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  existingLoansEMI: number;
  monthlySavingsGoal: number;
}): HealthScoreResult {
  const {
    monthlyIncome,
    monthlyExpenses,
    currentSavings,
    existingLoansEMI,
  } = profile;

  const recommendations: string[] = [];

  // Guard against zero income
  if (monthlyIncome <= 0) {
    return {
      totalScore: 0,
      grade: 'F',
      breakdown: {
        savingsRatio: { score: 0, weight: 30, value: 0, label: 'Savings Ratio' },
        expenseRatio: { score: 0, weight: 25, value: 0, label: 'Expense Ratio' },
        loanToIncomeRatio: { score: 0, weight: 25, value: 0, label: 'Loan-to-Income Ratio' },
        emergencyFundAdequacy: { score: 0, weight: 20, value: 0, label: 'Emergency Fund Adequacy' },
      },
      recommendations: ['Please update your monthly income to get an accurate health score.'],
    };
  }

  // 1. Savings Ratio (30% weight)
  //    Ideal: save >=20% of income → score 100
  //    0% savings → score 0
  const actualMonthlySavings = Math.max(0, monthlyIncome - monthlyExpenses - existingLoansEMI);
  const savingsRatioValue = actualMonthlySavings / monthlyIncome;
  let savingsRatioScore: number;
  if (savingsRatioValue >= 0.3) savingsRatioScore = 100;
  else if (savingsRatioValue >= 0.2) savingsRatioScore = 85;
  else if (savingsRatioValue >= 0.1) savingsRatioScore = 65;
  else if (savingsRatioValue > 0) savingsRatioScore = 40;
  else savingsRatioScore = 0;

  if (savingsRatioValue < 0.1) {
    recommendations.push('Aim to save at least 10% of your monthly income to build financial resilience.');
  }

  // 2. Expense Ratio (25% weight)
  //    Ideal: expenses ≤ 50% of income → score 100
  //    >90% → score 0
  const expenseRatioValue = monthlyExpenses / monthlyIncome;
  let expenseRatioScore: number;
  if (expenseRatioValue <= 0.5) expenseRatioScore = 100;
  else if (expenseRatioValue <= 0.6) expenseRatioScore = 80;
  else if (expenseRatioValue <= 0.7) expenseRatioScore = 60;
  else if (expenseRatioValue <= 0.8) expenseRatioScore = 40;
  else if (expenseRatioValue <= 0.9) expenseRatioScore = 20;
  else expenseRatioScore = 0;

  if (expenseRatioValue > 0.7) {
    recommendations.push('Your expenses exceed 70% of income. Review discretionary spending to free up cash flow.');
  }

  // 3. Loan-to-Income Ratio (25% weight)
  //    Ideal: EMIs ≤ 20% of income → score 100
  //    >50% → score 0
  const loanToIncomeValue = existingLoansEMI / monthlyIncome;
  let loanToIncomeScore: number;
  if (loanToIncomeValue <= 0.2) loanToIncomeScore = 100;
  else if (loanToIncomeValue <= 0.3) loanToIncomeScore = 75;
  else if (loanToIncomeValue <= 0.4) loanToIncomeScore = 50;
  else if (loanToIncomeValue <= 0.5) loanToIncomeScore = 25;
  else loanToIncomeScore = 0;

  if (loanToIncomeValue > 0.4) {
    recommendations.push('Your EMI obligations exceed 40% of income. Consider prepaying high-interest loans.');
  }

  // 4. Emergency Fund Adequacy (20% weight)
  //    Ideal: ≥ 6 months of expenses → score 100
  //    0 months → score 0
  const monthlyCommitments = monthlyExpenses + existingLoansEMI;
  const emergencyFundMonths = monthlyCommitments > 0 ? currentSavings / monthlyCommitments : 0;
  let emergencyFundScore: number;
  if (emergencyFundMonths >= 6) emergencyFundScore = 100;
  else if (emergencyFundMonths >= 3) emergencyFundScore = 75;
  else if (emergencyFundMonths >= 1) emergencyFundScore = 40;
  else emergencyFundScore = 0;

  if (emergencyFundMonths < 3) {
    recommendations.push(`Build an emergency fund covering at least 3 months of expenses (₹${(monthlyCommitments * 3).toLocaleString('en-IN')}).`);
  }

  // Weighted total
  const totalScore = Math.round(
    savingsRatioScore * 0.3 +
    expenseRatioScore * 0.25 +
    loanToIncomeScore * 0.25 +
    emergencyFundScore * 0.2
  );

  const grade: 'A' | 'B' | 'C' | 'D' | 'F' =
    totalScore >= 80 ? 'A' :
    totalScore >= 65 ? 'B' :
    totalScore >= 50 ? 'C' :
    totalScore >= 35 ? 'D' : 'F';

  if (recommendations.length === 0) {
    recommendations.push('Excellent financial health! Consider diversifying your investments for long-term growth.');
  }

  return {
    totalScore,
    grade,
    breakdown: {
      savingsRatio: {
        score: savingsRatioScore,
        weight: 30,
        value: Math.round(savingsRatioValue * 100),
        label: 'Savings Ratio',
      },
      expenseRatio: {
        score: expenseRatioScore,
        weight: 25,
        value: Math.round(expenseRatioValue * 100),
        label: 'Expense Ratio',
      },
      loanToIncomeRatio: {
        score: loanToIncomeScore,
        weight: 25,
        value: Math.round(loanToIncomeValue * 100),
        label: 'Loan-to-Income Ratio',
      },
      emergencyFundAdequacy: {
        score: emergencyFundScore,
        weight: 20,
        value: Math.round(emergencyFundMonths * 10) / 10,
        label: 'Emergency Fund Adequacy',
      },
    },
    recommendations,
  };
}

export function getGradeLabel(grade: string): string {
  const labels: Record<string, string> = {
    A: 'Excellent',
    B: 'Good',
    C: 'Fair',
    D: 'Needs Improvement',
    F: 'Critical',
  };
  return labels[grade] || 'Unknown';
}
