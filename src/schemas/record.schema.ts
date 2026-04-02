import { z } from 'zod';

export const createRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1, 'Category is required'),
    date: z.string().datetime('Invalid date format, must be ISO string'),
    notes: z.string().optional(),
  })
});

export const updateRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().optional(),
    date: z.string().datetime().optional(),
    notes: z.string().optional(),
  })
});

export const getRecordsQuerySchema = z.object({
  query: z.object({
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  })
});
