import { z } from "zod";

export const createCourseSchema = z.object({
  name: z
    .string()
    .min(1, "Course name is required")
    .min(3, "Course name must be at least 3 characters")
    .max(200, "Course name must be less than 200 characters"),
  code: z
    .string()
    .min(1, "Course code is required")
    .min(2, "Course code must be at least 2 characters")
    .max(20, "Course code must be less than 20 characters")
    .regex(/^[A-Z0-9]+$/, "Course code must be uppercase alphanumeric"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  department: z
    .string()
    .min(1, "Department is required")
    .max(100, "Department must be less than 100 characters"),
});

export type CreateCourseFormData = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial();

export type UpdateCourseFormData = z.infer<typeof updateCourseSchema>;
