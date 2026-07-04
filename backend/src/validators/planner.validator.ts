import { z } from 'zod';

export const vacationPlannerSchema = z.object({
  destination: z.string().min(2, 'Destination is required'),
  travelDate: z.string().datetime({ message: 'Invalid travel date (ISO 8601 required)' }),
  days: z.number().int().min(1).max(365),
  people: z.number().int().min(1).max(20),
  budget: z.number().min(0),
  originCity: z.string().optional().default('Mumbai'),
});

export const purchasePlannerSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  productCategory: z.enum(['laptop', 'mobile', 'tv', 'appliance', 'vehicle', 'furniture', 'other']),
  price: z.number().min(1, 'Price must be greater than 0'),
  emiTenureMonths: z.number().int().min(0).max(84).optional().default(0),
});

export const emergencyFundSchema = z.object({
  requestedAmount: z.number().min(1, 'Amount must be greater than 0'),
});
