import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateOTP, hashOTP, verifyOTP, sendOTPEmail } from '../utils/otp';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOTPSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();

// ─── POST /auth/signup ───────────────────────────────────────
router.post('/signup', validate(signupSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, mobileNumber, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return next(createError('Email is already registered', 409, 'EMAIL_EXISTS'));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        mobileNumber,
        passwordHash,
        financialProfile: { create: {} },
      },
      select: { id: true, fullName: true, email: true, mobileNumber: true, createdAt: true },
    });

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    // Save refresh token to database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.status(201).json({
      success: true,
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/login ────────────────────────────────────────
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(createError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return next(createError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    // Save refresh token to database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const { passwordHash, otpHash, otpExpiresAt, refreshToken: storedRf, ...safeUser } = user;

    res.json({
      success: true,
      data: { user: safeUser, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/forgot-password ──────────────────────────────
router.post('/forgot-password', validate(forgotPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, data: { message: 'If this email exists, an OTP has been sent.' } });
    }

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const otpExpiresAt = new Date(Date.now() + (Number(process.env.OTP_EXPIRES_MINUTES) || 10) * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otpHash, otpExpiresAt },
    });

    await sendOTPEmail(email, otp);

    res.json({ success: true, data: { message: 'If this email exists, an OTP has been sent.' } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/verify-otp ───────────────────────────────────
router.post('/verify-otp', validate(verifyOTPSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return next(createError('Invalid or expired OTP', 400, 'OTP_INVALID'));
    }

    if (user.otpExpiresAt < new Date()) {
      return next(createError('OTP has expired. Please request a new one.', 400, 'OTP_EXPIRED'));
    }

    const valid = await verifyOTP(otp, user.otpHash);
    if (!valid) {
      return next(createError('Invalid OTP', 400, 'OTP_INVALID'));
    }

    res.json({ success: true, data: { message: 'OTP verified successfully', email } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/reset-password ───────────────────────────────
router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return next(createError('Invalid or expired OTP', 400, 'OTP_INVALID'));
    }

    if (user.otpExpiresAt < new Date()) {
      return next(createError('OTP has expired', 400, 'OTP_EXPIRED'));
    }

    const valid = await verifyOTP(otp, user.otpHash);
    if (!valid) {
      return next(createError('Invalid OTP', 400, 'OTP_INVALID'));
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { passwordHash, otpHash: null, otpExpiresAt: null },
    });

    res.json({ success: true, data: { message: 'Password reset successfully' } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/refresh-token ─────────────────────────────────
router.post('/refresh-token', validate(refreshTokenSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    let payload: { userId: string; email: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return next(createError('Refresh token is invalid or expired', 401, 'REFRESH_TOKEN_INVALID'));
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshToken !== refreshToken) {
      return next(createError('Refresh token is invalid or no longer active', 401, 'REFRESH_TOKEN_INVALID'));
    }

    const newAccessToken = signAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = signRefreshToken({ userId: user.id, email: user.email });

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/logout ────────────────────────────────────────
router.post('/logout', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { refreshToken: null },
    });
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (err) {
    next(err);
  }
});

export default router;
