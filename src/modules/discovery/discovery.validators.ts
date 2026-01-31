// src/modules/discovery/discovery.validators.ts
import { z } from 'zod';

export const discoverySearchSchema = z.object({
  q: z.string().min(2, 'Search term too short').max(200),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  source: z
    .union([
      z.string(), z.array(z.string())])
    .optional()
    .transform((val) => (Array.isArray(val) ? val : val ? [val] : undefined)),
});

export type DiscoverySearchInput = z.infer<typeof discoverySearchSchema>;