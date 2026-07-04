import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';
import { updateProfileSchema, updateFinancialProfileSchema } from '../validators/profile.validator';

const router = Router();
router.use(authenticate);

// ─── GET /profile ────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        address: true,
        city: true,
        occupation: true,
        age: true,
        lifestyleType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return next(createError('User not found', 404, 'USER_NOT_FOUND'));

    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /profile ─────────────────────────────────────────────
router.put('/', validate(updateProfileSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: req.body,
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        address: true,
        city: true,
        occupation: true,
        age: true,
        lifestyleType: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /profile/financial-details ──────────────────────────
router.get('/financial-details', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await prisma.financialProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!profile) return next(createError('Financial profile not found', 404, 'PROFILE_NOT_FOUND'));

    res.json({ success: true, data: { financialProfile: profile } });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /profile/financial-details ──────────────────────────
router.put('/financial-details', validate(updateFinancialProfileSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await prisma.financialProfile.upsert({
      where: { userId: req.user!.userId },
      update: req.body,
      create: { userId: req.user!.userId, ...req.body },
    });

    res.json({ success: true, data: { financialProfile: profile } });
  } catch (err) {
    next(err);
  }
});

export default router;
