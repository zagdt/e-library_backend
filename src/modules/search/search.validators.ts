import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200, 'Query too long'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
  category: z.enum(['BOOK', 'JOURNAL', 'PAPER', 'MAGAZINE', 'THESIS', 'OTHER']).optional(),
  department: z.string().optional(),
  year: z.coerce.number().int().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
  sortBy: z.enum(['relevance', 'createdAt', 'downloadCount', 'title']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
