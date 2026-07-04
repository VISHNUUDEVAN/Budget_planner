import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

// ─── GET /notifications ──────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { unread } = req.query;

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unread === 'true' ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({
      success: true,
      data: { notifications, unreadCount, total: notifications.length },
    });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /notifications/:id/read ───────────────────────────
router.patch('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return next(createError('Notification not found', 404, 'NOT_FOUND'));
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ success: true, data: { notification: updated } });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /notifications/read-all ───────────────────────────
router.patch('/read-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (err) {
    next(err);
  }
});

export default router;
