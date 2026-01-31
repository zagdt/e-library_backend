// src/modules/discovery/sources/agris.client.ts
import axios from 'axios';
import { BaseDiscoverySource } from './base.source.js';
import type { DiscoveryResult, DiscoverySearchQuery } from '../types.js';

export class AGRISClient extends BaseDiscoverySource {
  name = 'agris' as const;

  async search({ q, page = 1, limit = 20 }: DiscoverySearchQuery) {
    const url = 'https://agris.fao.org/agris-search/rest/search';
    const response = await axios.post(
      url,
      {
        query: q,
        start: (page - 1) * limit,
        rows: limit,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 12000,
      }
    );

    const items = response.data.response?.docs || [];

    const results: DiscoveryResult[] = items.map((item: any) => ({
      id: `agris-${item.arn}`,
      title: item.title?.[0] || 'Untitled',
      authors: item.creator,
      abstract: item.description?.[0],
      publishedDate: item.date,
      source: this.name,
      url: item.link?.[0] || `https://agris.fao.org/agris-search/search.do?recordID=${item.arn}`,
      subjects: item.subject,
    }));

    return { results, total: response.data.response?.numFound || 0 };
  }

  async harvest(): Promise<void> {
    // Optional background harvest implementation
    // Could be used to periodically fetch new records
    console.log(`${this.name}: Harvest not implemented`);
  }
}