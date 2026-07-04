import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';
import { createNotification } from '../services/notificationService';
import {
  computeVacationPlan,
  computePurchaseVerdict,
  computeEmergencyFundSafety,
  computeSavingsAnalysis,
} from '../services/decisionEngine';
import {
  vacationPlannerSchema,
  purchasePlannerSchema,
  emergencyFundSchema,
} from '../validators/planner.validator';
import { NotificationType } from '@prisma/client';

const router = Router();
router.use(authenticate);

async function getFinancialProfile(userId: string) {
  const profile = await prisma.financialProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Financial profile not found. Please complete your profile first.', 404, 'PROFILE_NOT_FOUND');
  return {
    monthlyIncome: profile.monthlyIncome,
    monthlyExpenses: profile.monthlyExpenses,
    currentSavings: profile.currentSavings,
    existingLoansEMI: profile.existingLoansEMI,
    monthlySavingsGoal: profile.monthlySavingsGoal,
  };
}

// ─── POST /planner/vacation ──────────────────────────────────
router.post('/vacation', validate(vacationPlannerSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const profile = await getFinancialProfile(userId);
    const result = computeVacationPlan(req.body, profile);

    // Notify if over budget
    if (!result.budgetFeasible) {
      await createNotification(
        userId,
        `⚠️ Your vacation plan to ${result.destination} exceeds your available budget of ₹${result.availableBudget.toLocaleString('en-IN')}. Consider a shorter trip or different dates.`,
        NotificationType.warning
      );
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ─── POST /planner/purchase ──────────────────────────────────
router.post('/purchase', validate(purchasePlannerSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const profile = await getFinancialProfile(userId);
    const result = computePurchaseVerdict(req.body, profile);

    // Notify if not recommended
    if (!result.recommended) {
      await createNotification(
        userId,
        `⚠️ Purchase of "${req.body.productName}" flagged: ${result.reason}`,
        NotificationType.warning
      );
    } else {
      await createNotification(
        userId,
        `✅ Purchase plan for "${req.body.productName}" looks good! Affordability score: ${result.affordabilityScore}/100.`,
        NotificationType.success
      );
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ─── POST /planner/emergency-fund ────────────────────────────
router.post('/emergency-fund', validate(emergencyFundSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const profile = await getFinancialProfile(userId);
    const result = computeEmergencyFundSafety(req.body, profile);

    if (result.verdict === 'not_recommended') {
      await createNotification(
        userId,
        `⚠️ Withdrawal of ₹${req.body.requestedAmount.toLocaleString('en-IN')} from emergency fund is not recommended. Safe withdrawal limit is ₹${result.safeAmount.toLocaleString('en-IN')}.`,
        NotificationType.warning
      );
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ─── GET /planner/savings-analysis ───────────────────────────
router.get('/savings-analysis', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const profile = await getFinancialProfile(userId);
    const result = computeSavingsAnalysis(profile);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
