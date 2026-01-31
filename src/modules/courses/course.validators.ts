import { z } from 'zod';

export const createCourseSchema = z.object({
  code: z.string().min(2, 'Course code is required').max(20, 'Course code too long'),
  name: z.string().min(2, 'Course name is required').max(200, 'Course name too long'),
  department: z.string().min(1, 'Department is required').max(200),
});

export const updateCourseSchema = z.object({
  code: z.string().min(2).max(20).optional(),
  name: z.string().min(2).max(200).optional(),
  department: z.string().min(1).max(200).optional(),
});

export const courseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  department: z.string().optional(),
  search: z.string().max(100).optional(),
});

export const courseIdSchema = z.object({
  id: z.string().uuid('Invalid course ID'),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseQueryInput = z.infer<typeof courseQuerySchema>;

export const courseResourcesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(100).optional(),
  category: z.enum(['BOOK', 'JOURNAL', 'PAPER', 'MAGAZINE', 'THESIS', 'OTHER']).optional(),
});

export type CourseResourcesQueryInput = z.infer<typeof courseResourcesQuerySchema>;
