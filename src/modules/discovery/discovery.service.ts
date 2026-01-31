// src/modules/discovery/discovery.service.ts
import { OATDClient } from './sources/oatd.client.js';
import { AGRISClient } from './sources/agris.client.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import type { DiscoverySearchQuery, DiscoveryResult } from './types.js';
import { prisma } from '../../config/database.js';
import { COREClient } from './sources/core.client.js';
import { OpenAlexClient } from './sources/openalex.client.js';
import { DOAJClient } from './sources/doaj.client.js';
import { ERICClient } from './sources/eric.client.js';
import { DOABClient } from './sources/doab.client.js';
import { GoogleScholarClient } from './sources/google-scholar.client.js';

const clients = {
  openalex: new OpenAlexClient(),
  core: new COREClient(),
  doaj: new DOAJClient(),      // Added
  eric: new ERICClient(),      // Added
  doab: new DOABClient(),      // Added
  googleScholar: new GoogleScholarClient(), // Requires SERPAPI_KEY
  // Note: OATD and AGRIS are commented out but can be re-added
  // oatd: new OATDClient(),
  // agris: new AGRISClient(),
} as const;
export class DiscoveryService {
  private async searchSource(
    source: keyof typeof clients,
    query: DiscoverySearchQuery
  ) {
    if (!clients[source]) throw new NotFoundError('Source not supported');

    try {
      const result = await clients[source].search(query);
      return result;
    } catch (error) {
      console.error(`Search failed for ${source}:`, error);
      return { results: [], total: 0 };
    }
  }

  //   async search(query: DiscoverySearchQuery) {
  //     const { q, source, page = 1, limit = 20 } = query;

  //     if (!q || q.trim().length < 2) {
  //       throw new Error('Search query must be at least 2 characters');
  //     }

  //     const sourcesToSearch = source
  //       ? Array.isArray(source)
  //         ? source
  //         : [source]
  //       : (Object.keys(clients) as (keyof typeof clients)[]);

  //     const searches = sourcesToSearch.map((src) => this.searchSource(src, { ...query, page, limit }));

  //     const results = await Promise.allSettled(searches);

  //     let allResults: DiscoveryResult[] = [];
  //     let total = 0;

  //     results.forEach((res, idx) => {
  //       if (res.status === 'fulfilled') {
  //         allResults.push(...res.value.results);
  //         total += res.value.total;
  //       }
  //     });

  //     // Sort by relevance (simple: title match first)
  //     allResults.sort((a, b) => {
  //       const aMatch = a.title.toLowerCase().includes(q.toLowerCase()) ? -1 : 0;
  //       const bMatch = b.title.toLowerCase().includes(q.toLowerCase()) ? -1 : 0;
  //       return aMatch - bMatch || a.title.localeCompare(b.title);
  //     });

  //     const paginated = allResults.slice((page - 1) * limit, page * limit);

  //     return {
  //       data: paginated,
  //       pagination: {
  //         total,
  //         page,
  //         limit,
  //         totalPages: Math.ceil(allResults.length / limit),
  //         sources: sourcesToSearch,
  //       },
  //     };
  //   }

  // Update the search method in discovery.service.ts
  async search(query: DiscoverySearchQuery) {
    const { q, source, page = 1, limit = 20 } = query;

    if (!q || q.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }

    const sourcesToSearch = source
      ? Array.isArray(source)
        ? source
        : [source]
      : (Object.keys(clients) as (keyof typeof clients)[]);

    console.log(`Searching sources: ${sourcesToSearch.join(', ')}`);

    const searches = sourcesToSearch.map((src) =>
      this.searchSource(src, { ...query, page, limit })
    );

    const results = await Promise.allSettled(searches);

    let allResults: DiscoveryResult[] = [];
    let total = 0;

    results.forEach((res, idx) => {
      const sourceName = sourcesToSearch[idx];
      if (res.status === 'fulfilled') {
        console.log(`${sourceName}: Found ${res.value.results.length} results, total ${res.value.total}`);
        allResults.push(...res.value.results);
        total += res.value.total;
      } else {
        console.warn(`${sourceName}: Failed - ${res.reason}`);
      }
    });

    // Remove duplicates based on title and authors
    const uniqueResults = this.removeDuplicates(allResults);

    // Sort by relevance (title match, then date recency)
    uniqueResults.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const queryLower = q.toLowerCase();

      // Exact match in title gets highest priority
      if (aTitle === queryLower && bTitle !== queryLower) return -1;
      if (bTitle === queryLower && aTitle !== queryLower) return 1;

      // Contains query in title
      const aContains = aTitle.includes(queryLower);
      const bContains = bTitle.includes(queryLower);
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;

      // More recent first
      const aYear = parseInt(a.publishedDate || '0');
      const bYear = parseInt(b.publishedDate || '0');
      if (aYear && bYear) return bYear - aYear;

      // Alphabetical fallback
      return aTitle.localeCompare(bTitle);
    });

    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginated = uniqueResults.slice(startIdx, endIdx);

    return {
      data: paginated,
      pagination: {
        total: uniqueResults.length,
        page,
        limit,
        totalPages: Math.ceil(uniqueResults.length / limit),
        sources: sourcesToSearch,
      },
    };
  }

  private removeDuplicates(results: DiscoveryResult[]): DiscoveryResult[] {
    const seen = new Set<string>();
    return results.filter(item => {
      // Create a unique key from title and first author
      const firstAuthor = item.authors?.[0] || '';
      const key = `${item.title.toLowerCase()}-${firstAuthor.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }


  async getSources() {
    return Object.keys(clients).map((key) => ({
      id: key,
      name: key.toUpperCase(),
      description: `${key} Open Access Repository`,
      free: true,
    }));
  }
}

export const discoveryService = new DiscoveryService();