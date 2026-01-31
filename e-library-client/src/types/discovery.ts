// src/types/discovery.ts
export interface DiscoverySource {
  id: string;
  name: string;
  description: string;
  free: boolean;
}

export interface DiscoveryResult {
  id: string;
  title: string;
  authors?: string[];
  abstract?: string;
  publishedDate?: string;
  source: string;
  url: string;
  doi?: string;
  pdfUrl?: string;
  subjects?: string[];
}

export interface DiscoverySearchParams {
  q: string;
  page?: number;
  limit?: number;
  source?: string | string[];
}

export interface DiscoverySearchResponse {
  success: boolean;
  data: DiscoveryResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    sources: string[];
  };
  message?: string;
}

export interface DiscoverySourcesResponse {
  success: boolean;
  data: DiscoverySource[];
}

export interface DiscoverySourceStatus {
  source: string;
  status: 'loading' | 'success' | 'error';
  results: number;
  total: number;
  error?: string;
}