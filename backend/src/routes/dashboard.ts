import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { computeHealthScore } from '../services/healthScore';

const router = Router();
router.use(authenticate);

// ─── GET /dashboard/summary ──────────────────────────────────
router.get('/summary', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const [user, financialProfile, loans, recentTransactions, goals] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { fullName: true, lifestyleType: true } }),
      prisma.financialProfile.findUnique({ where: { userId } }),
      prisma.loan.findMany({ where: { userId } }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      prisma.goal.findMany({ where: { userId, status: 'active' } }),
    ]);

    if (!financialProfile) {
      return next(createError('Financial profile not found', 404, 'PROFILE_NOT_FOUND'));
    }

    // Aggregate totals from transactions (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentAll = await prisma.transaction.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
    });

    const totalIncome = recentAll.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = recentAll.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Expense breakdown by category
    const categoryBreakdown: Record<string, number> = {};
    recentAll
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    const expenseBreakdown = Object.entries(categoryBreakdown).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }));

    // Total loan amount outstanding
    const totalLoanAmount = loans.reduce((s, l) => s + l.principal, 0);
    const totalEMI = loans.reduce((s, l) => s + l.emiAmount, 0);

    // Savings progress
    const savingsProgress =
      financialProfile.monthlySavingsGoal > 0
        ? Math.min(100, Math.round(((financialProfile.monthlyIncome - financialProfile.monthlyExpenses - totalEMI) / financialProfile.monthlySavingsGoal) * 100))
        : 0;

    // Health score
    const healthScore = computeHealthScore({
      monthlyIncome: financialProfile.monthlyIncome,
      monthlyExpenses: financialProfile.monthlyExpenses,
      currentSavings: financialProfile.currentSavings,
      existingLoansEMI: financialProfile.existingLoansEMI,
      monthlySavingsGoal: financialProfile.monthlySavingsGoal,
    });

    // Upcoming payments (loans with next EMI)
    const upcomingPayments = loans.map((loan) => ({
      id: loan.id,
      name: loan.loanName,
      amount: loan.emiAmount,
      dueDate: (() => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() + 1);
        return d.toISOString();
      })(),
      type: 'EMI',
    }));

    // Budget summary (income vs expenses vs savings)
    const budgetSummary = {
      income: financialProfile.monthlyIncome,
      expenses: financialProfile.monthlyExpenses,
      emi: financialProfile.existingLoansEMI,
      savingsGoal: financialProfile.monthlySavingsGoal,
      surplus: Math.max(0, financialProfile.monthlyIncome - financialProfile.monthlyExpenses - financialProfile.existingLoansEMI - financialProfile.monthlySavingsGoal),
    };

    res.json({
      success: true,
      data: {
        user,
        summary: {
          monthlyIncome: financialProfile.monthlyIncome,
          monthlyExpenses: financialProfile.monthlyExpenses,
          currentSavings: financialProfile.currentSavings,
          totalLoanAmount,
          totalEMI,
          savingsProgress,
          healthScore: healthScore.totalScore,
          healthGrade: healthScore.grade,
        },
        budgetSummary,
        expenseBreakdown,
        recentTransactions,
        upcomingPayments,
        activeGoals: goals,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /dashboard/health-score ────────────────────────────
router.get('/health-score', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const financialProfile = await prisma.financialProfile.findUnique({ where: { userId } });
    if (!financialProfile) {
      return next(createError('Financial profile not found', 404, 'PROFILE_NOT_FOUND'));
    }

    const result = computeHealthScore({
      monthlyIncome: financialProfile.monthlyIncome,
      monthlyExpenses: financialProfile.monthlyExpenses,
      currentSavings: financialProfile.currentSavings,
      existingLoansEMI: financialProfile.existingLoansEMI,
      monthlySavingsGoal: financialProfile.monthlySavingsGoal,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
