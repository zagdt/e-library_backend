// src/modules/discovery/sources/google-scholar.client.ts
/**
 * Google Scholar Client
 * Uses SerpAPI for reliable Google Scholar search results
 * Requires SERPAPI_KEY environment variable
 * 
 * SerpAPI provides structured results from Google Scholar including:
 * - Title, authors, publication info
 * - Citations count
 * - PDF links when available
 * - Full text links
 */

import type { DiscoverySearchQuery, DiscoveryResult } from '../types.js';

interface SerpAPIScholarResult {
    title: string;
    link: string;
    snippet: string;
    publication_info?: {
        authors?: { name: string; link?: string }[];
        summary?: string;
    };
    inline_links?: {
        serpapi_cite_link?: string;
        cited_by?: { total: number; link: string };
        versions?: { total: number; link: string };
        related_pages_link?: string;
    };
    resources?: {
        title: string;
        file_format: string;
        link: string;
    }[];
}

interface SerpAPIResponse {
    organic_results?: SerpAPIScholarResult[];
    search_information?: {
        total_results?: number;
        query_displayed?: string;
    };
    error?: string;
}

export class GoogleScholarClient {
    private apiKey: string | undefined;
    private baseUrl = 'https://serpapi.com/search';

    constructor() {
        this.apiKey = process.env.SERPAPI_KEY;
    }

    async search(query: DiscoverySearchQuery): Promise<{ results: DiscoveryResult[]; total: number }> {
        if (!this.apiKey) {
            console.warn('SERPAPI_KEY not configured - Google Scholar search disabled');
            return { results: [], total: 0 };
        }

        const { q, page = 1, limit = 20 } = query;
        const start = (page - 1) * limit;

        try {
            const params = new URLSearchParams({
                engine: 'google_scholar',
                q: q,
                api_key: this.apiKey,
                start: start.toString(),
                num: Math.min(limit, 20).toString(), // SerpAPI max is 20
            });

            const response = await fetch(`${this.baseUrl}?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json() as SerpAPIResponse;

            if (data.error) {
                console.error('SerpAPI error:', data.error);
                return { results: [], total: 0 };
            }

            const results: DiscoveryResult[] = (data.organic_results || []).map((item) => {
                // Extract year from publication info if available
                const yearMatch = item.publication_info?.summary?.match(/\b(19|20)\d{2}\b/);
                const publishedDate = yearMatch ? yearMatch[0] : undefined;

                // Get PDF/Full text URL if available
                const pdfResource = item.resources?.find(r =>
                    r.file_format?.toLowerCase() === 'pdf' ||
                    r.title?.toLowerCase().includes('pdf')
                );

                return {
                    id: `gs-${Buffer.from(item.link).toString('base64').slice(0, 20)}`,
                    title: item.title,
                    authors: item.publication_info?.authors?.map(a => a.name) || [],
                    description: item.snippet,
                    source: 'googleScholar' as const,
                    url: item.link,
                    pdfUrl: pdfResource?.link,
                    publishedDate,
                    citedBy: item.inline_links?.cited_by?.total,
                };
            });

            // SerpAPI doesn't always return total, estimate from result set
            const total = data.search_information?.total_results || results.length;

            return { results, total };
        } catch (error) {
            console.error('Google Scholar search failed:', error);
            return { results: [], total: 0 };
        }
    }
}
