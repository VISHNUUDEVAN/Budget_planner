import { prisma } from '../config/database';
import { NotificationType } from '@prisma/client';

/**
 * Create a notification for a user
 */
export async function createNotification(
  userId: string,
  message: string,
  type: NotificationType
): Promise<void> {
  await prisma.notification.create({
    data: { userId, message, type },
  });
}

/**
 * Check health score thresholds and auto-generate notifications
 */
export async function checkHealthScoreNotification(
  userId: string,
  score: number
): Promise<void> {
  if (score < 40) {
    await createNotification(
      userId,
      `⚠️ Your Financial Health Score dropped to ${score}/100. Review your spending and loan commitments urgently.`,
      NotificationType.warning
    );
  } else if (score >= 80) {
    await createNotification(
      userId,
      `🎉 Excellent! Your Financial Health Score is ${score}/100. Keep up the great financial discipline!`,
      NotificationType.success
    );
  }
}
