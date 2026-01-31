import { z } from 'zod';

export const userRoleEnum = z.enum(['STUDENT', 'STAFF', 'ADMIN']);

export const updateUserRoleSchema = z.object({
  role: userRoleEnum,
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: userRoleEnum.optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['createdAt', 'name', 'email', 'role']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  entity: z.string().optional(),
  action: z.string().optional(),
  performedById: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const userIdSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type AuditLogQueryInput = z.infer<typeof auditLogQuerySchema>;
