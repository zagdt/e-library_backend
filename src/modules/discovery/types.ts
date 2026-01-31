// src/modules/discovery/types.ts
export type DiscoverySource =
  | 'core'
  | 'openalex'
  | 'doaj'      // Added
  | 'eric'      // Added
  | 'doab'     // Added
  | 'googleScholar';

export interface DiscoveryResult {
  id: string;
  title: string;
  authors?: string[];
  abstract?: string;
  description?: string; // Alternative to abstract
  publishedDate?: string;
  source: DiscoverySource;
  url: string;
  doi?: string;
  pdfUrl?: string;
  subjects?: string[];
  citedBy?: number; // For Google Scholar
}

export interface DiscoverySearchQuery {
  q: string;
  page?: number;
  limit?: number;
  source?: DiscoverySource | DiscoverySource[];
  subject?: string;
}