import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';
import { updateProfileSchema, updateFinancialProfileSchema, changePasswordSchema } from '../validators/profile.validator';

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
        profilePhoto: true,
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
    if (req.body.email) {
      const existing = await prisma.user.findFirst({
        where: {
          email: req.body.email,
          NOT: { id: req.user!.userId }
        }
      });
      if (existing) {
        return next(createError('Email is already registered by another account', 409, 'EMAIL_EXISTS'));
      }
    }

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
        profilePhoto: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /profile/change-password ────────────────────────────
router.put('/change-password', validate(changePasswordSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId }
    });

    if (!user) {
      return next(createError('User not found', 404, 'USER_NOT_FOUND'));
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return next(createError('Incorrect current password', 400, 'INCORRECT_CURRENT_PASSWORD'));
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { passwordHash }
    });

    res.json({ success: true, data: { message: 'Password updated successfully!' } });
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
