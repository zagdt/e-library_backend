// src/modules/discovery/sources/eric.client.ts - UPDATED
import axios from 'axios';
import { BaseDiscoverySource } from './base.source.js';
import type { DiscoveryResult, DiscoverySearchQuery } from '../types.js';

export class ERICClient extends BaseDiscoverySource {
  name = 'eric' as const;

  async search({ q, page = 1, limit = 20 }: DiscoverySearchQuery) {
    try {
      // ERIC API uses start parameter for pagination (0-based)
      const start = (page - 1) * limit;
      
      const response = await axios.get('https://api.ies.ed.gov/eric/', {
        params: {
          search: q,
          rows: limit,
          start: start,
          format: 'json',
        },
        headers: {
          'Accept': 'application/json',
        },
        timeout: 20000,
      });

      const items = response.data?.response?.docs || [];
      
      const results: DiscoveryResult[] = items.map((item: any) => {
        // Parse authors from creator field (could be string or array)
        let authors: string[] = [];
        if (Array.isArray(item.creator)) {
          authors = item.creator;
        } else if (typeof item.creator === 'string') {
          authors = [item.creator];
        }

        // Get full abstract (not just first letter)
        let abstract = '';
        if (Array.isArray(item.description)) {
          abstract = item.description.join(' ');
        } else if (typeof item.description === 'string') {
          abstract = item.description;
        }

        // Get subjects/descriptors
        const subjects: string[] = [];
        if (Array.isArray(item.descriptor)) {
          subjects.push(...item.descriptor);
        }
        if (Array.isArray(item.subject)) {
          subjects.push(...item.subject.map((s: any) => 
            typeof s === 'string' ? s : s.term || s.name || ''
          ));
        }

        return {
          id: `eric-${item.id || item.identifier?.[0] || Math.random().toString(36).substr(2, 9)}`,
          title: item.title || 'Untitled',
          authors: authors.filter(Boolean),
          abstract: abstract || undefined,
          publishedDate: item.publicationdateyear?.toString() || 
                        item.date?.slice(0, 4) || 
                        item.publicationYear?.toString(),
          source: this.name,
          url: item.url || 
               item.link?.[0]?.url || 
               (item.id ? `https://eric.ed.gov/?id=${item.id}` : 'https://eric.ed.gov'),
          pdfUrl: item.fulltext?.find((ft: string) => ft.includes('.pdf')) || 
                  item.link?.find((l: any) => l.type === 'pdf')?.url ||
                  undefined,
          doi: item.identifier?.find((id: string) => id.startsWith('10.')) || 
               item.doi ||
               undefined,
          subjects: subjects.filter(Boolean).slice(0, 10), // Limit to 10 subjects
        };
      });

      return {
        results,
        total: response.data?.response?.numFound || 0,
      };
    } catch (error: any) {
      console.error(`ERIC API error: ${error.message}`);
      return { results: [], total: 0 };
    }
  }

  async harvest(): Promise<void> {
    // Optional background harvest implementation
    // Could be used to periodically fetch new records
    console.log(`${this.name}: Harvest not implemented`);
  }
}