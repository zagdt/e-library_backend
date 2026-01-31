import { z } from 'zod';

export const requestStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']);

export const createRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  authors: z.string().max(500).optional(),
  reason: z.string().min(10, 'Please provide a detailed reason').max(2000, 'Reason too long'),
});

export const updateRequestSchema = z.object({
  status: requestStatusEnum.optional(),
  adminReply: z.string().max(2000).optional(),
});

export const requestQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: requestStatusEnum.optional(),
  userId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const requestIdSchema = z.object({
  id: z.string().uuid('Invalid request ID'),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type RequestQueryInput = z.infer<typeof requestQuerySchema>;
