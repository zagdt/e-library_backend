// src/modules/discovery/sources/core.client.ts - UPDATED
import axios from 'axios';
import { BaseDiscoverySource } from './base.source.js';
import type { DiscoveryResult, DiscoverySearchQuery } from '../types.js';

export class COREClient extends BaseDiscoverySource {
  name = 'core' as const;
  private apiKey: string | null = null;
  private lastRequestTime = 0;
  private readonly REQUEST_INTERVAL = 1000; // 1 second between requests

  constructor() {
    super();
    // Get API key from environment variable (optional but recommended)
    this.apiKey = process.env.CORE_API_KEY || null;
  }

  async search({ q, page = 1, limit = 20 }: DiscoverySearchQuery) {
    // Rate limiting: wait if we made a request recently
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.REQUEST_INTERVAL) {
      await new Promise(resolve => 
        setTimeout(resolve, this.REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }

    try {
      const headers: Record<string, string> = {
        'User-Agent': 'VictoriaUniversityLMS/1.0',
        'Accept': 'application/json',
      };

      // Add API key if available (increases rate limit)
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await axios.get('https://api.core.ac.uk/v3/search/works', {
        params: {
          q,
          limit: Math.min(limit, 100), // CORE max is 100
          offset: (page - 1) * limit,
        },
        headers,
        timeout: 30000, // Increased timeout
        validateStatus: (status) => status < 500, // Don't throw on 429/403
      });

      this.lastRequestTime = Date.now();

      // Handle rate limit or other errors
      if (response.status === 429) {
        console.warn('CORE API rate limit exceeded');
        return { results: [], total: 0 };
      }

      if (response.status === 403) {
        console.warn('CORE API access forbidden - check API key');
        return { results: [], total: 0 };
      }

      if (!response.data?.results) {
        return { results: [], total: 0 };
      }

      const results: DiscoveryResult[] = response.data.results.map((item: any) => ({
        id: `core-${item.id}`,
        title: item.title || 'Untitled',
        authors: item.authors?.map((author: any) => author.fullName) || [],
        abstract: item.abstract,
        publishedDate: item.yearPublished || 
                      item.datePublished?.slice(0, 4) || 
                      item.publishedDate?.slice(0, 4),
        source: this.name,
        url: item.downloadUrl || 
             item.sourceUrl || 
             item.fullTextUrl || 
             item.urls?.[0] ||
             `https://core.ac.uk/display/${item.id}`,
        pdfUrl: item.downloadUrl,
        doi: item.doi,
        subjects: item.language?.length ? [`Language: ${item.language.join(', ')}`] : undefined,
      }));

      return {
        results,
        total: response.data.totalHits || 0,
      };
    } catch (error: any) {
      // Don't throw, just return empty results
      console.error(`CORE API error: ${error.message}`);
      if (error.response?.status === 429) {
        console.warn('CORE rate limit hit - consider adding API key');
      }
      return { results: [], total: 0 };
    }
  }

  async harvest(): Promise<void> {
    // Optional background harvest implementation
    // Could be used to periodically fetch new records
    console.log(`${this.name}: Harvest not implemented`);
  }
}