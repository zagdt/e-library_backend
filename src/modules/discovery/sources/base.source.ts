// src/modules/discovery/sources/base.source.ts
import type { DiscoveryResult, DiscoverySearchQuery } from '../types.js';

export abstract class BaseDiscoverySource {
  abstract name: string;
  abstract search(query: DiscoverySearchQuery): Promise<{ results: DiscoveryResult[]; total: number }>;
  abstract harvest?(): Promise<void>; // Optional background harvest
}