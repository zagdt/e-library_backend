import { z } from 'zod';

export const resourceCategoryEnum = z.enum(['BOOK', 'JOURNAL', 'PAPER', 'MAGAZINE', 'THESIS', 'OTHER']);
export const accessTypeEnum = z.enum(['VIEW_ONLY', 'DOWNLOADABLE']);

export const createResourceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  authors: z.array(z.string()).min(1, 'At least one author is required'),
  description: z.string().max(5000, 'Description too long').optional(),
  category: resourceCategoryEnum,
  department: z.string().min(1, 'Department is required').max(200),
  publicationYear: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional(),
  accessType: accessTypeEnum.default('DOWNLOADABLE'),
  tags: z.array(z.string()).default([]),
  courseIds: z.array(z.string().uuid()).default([]),
});

export const updateResourceSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  authors: z.array(z.string()).min(1).optional(),
  description: z.string().max(5000).optional().nullable(),
  category: resourceCategoryEnum.optional(),
  department: z.string().min(1).max(200).optional(),
  publicationYear: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional().nullable(),
  accessType: accessTypeEnum.optional(),
  tags: z.array(z.string()).optional(),
  courseIds: z.array(z.string().uuid()).optional(),
  isActive: z.boolean().optional(),
});

export const resourceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  category: resourceCategoryEnum.optional(),
  department: z.string().optional(),
  year: z.coerce.number().int().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
  accessType: accessTypeEnum.optional(),
  sortBy: z.enum(['createdAt', 'title', 'downloadCount', 'viewCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const resourceIdSchema = z.object({
  id: z.string().uuid('Invalid resource ID'),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ResourceQueryInput = z.infer<typeof resourceQuerySchema>;
