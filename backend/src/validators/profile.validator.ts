import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  profilePhoto: z.string().optional(),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  occupation: z.string().optional(),
  age: z.number().int().min(13).max(120).optional(),
  lifestyleType: z
    .enum(['student', 'family', 'working_professional', 'bachelor', 'business_owner', 'freelancer', 'job_seeker', 'retired'])
    .optional(),
});

export const updateFinancialProfileSchema = z.object({
  monthlyIncome: z.number().min(0).optional(),
  monthlyExpenses: z.number().min(0).optional(),
  currentSavings: z.number().min(0).optional(),
  existingLoansEMI: z.number().min(0).optional(),
  monthlySavingsGoal: z.number().min(0).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'New password must contain at least one number'),
});
