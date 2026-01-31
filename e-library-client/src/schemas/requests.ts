import { z } from "zod";

export const statusOptions = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" },
] as const;

export const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const requestCategoryEnum = z.enum(["BOOK", "JOURNAL", "PAPER", "THESIS", "EQUIPMENT", "OTHER"]);

export const createRequestSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  authors: z.string().optional(),
  reason: z
    .string()
    .min(1, "Reason is required")
    .min(10, "Reason must be at least 10 characters")
    .max(5000, "Reason must be less than 5000 characters"),
  category: requestCategoryEnum.optional(),
  priority: priorityEnum,
  dueDate: z.string().optional(),
});

export type CreateRequestFormData = z.infer<typeof createRequestSchema>;

export const updateRequestSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"]).optional(),
  adminReply: z.string().max(1000, "Reply must be less than 1000 characters").optional(),
  accessInstructions: z.string().max(5000).optional(),
  externalSourceUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  fulfilledResourceId: z.string().uuid().optional().or(z.literal("")),
});

export type UpdateRequestFormData = z.infer<typeof updateRequestSchema>;
