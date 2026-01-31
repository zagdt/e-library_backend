// src/modules/discovery/sources/doaj.client.ts
import axios from 'axios';
import { BaseDiscoverySource } from './base.source.js';
import type { DiscoveryResult, DiscoverySearchQuery } from '../types.js';

export class DOAJClient extends BaseDiscoverySource {
  name = 'doaj' as const;

  async search({ q, page = 1, limit = 20 }: DiscoverySearchQuery) {
    // DOAJ API: https://doaj.org/api/v2/docs#!/Search/get_api_v2_search_articles_query
    const response = await axios.get(`https://doaj.org/api/v2/search/articles/${encodeURIComponent(q)}`, {
      params: {
        page: page,
        pageSize: limit,
      },
      headers: {
        'Accept': 'application/json',
      },
      timeout: 15000,
    });

    const results: DiscoveryResult[] = response.data.results?.map((item: any) => ({
      id: `doaj-${item.id}`,
      title: item.bibjson?.title || 'Untitled',
      authors: item.bibjson?.author?.map((a: any) => a.name) || [],
      abstract: item.bibjson?.abstract,
      publishedDate: item.created_date?.slice(0, 4) || item.bibjson?.year,
      source: this.name,
      url: item.bibjson?.link?.find((l: any) => l.type === 'fulltext')?.url || item.bibjson?.link?.[0]?.url,
      doi: item.bibjson?.identifier?.find((id: any) => id.type === 'doi')?.id,
      pdfUrl: item.bibjson?.link?.find((l: any) => l.type === 'fulltext' && l.content_type === 'pdf')?.url,
      subjects: item.bibjson?.subject?.map((s: any) => s.term) || [],
    })) || [];

    return {
      results,
      total: response.data.total || 0,
    };
  }

  async harvest(): Promise<void> {
    // Optional background harvest implementation
    // Could be used to periodically fetch new records
    console.log(`${this.name}: Harvest not implemented`);
  }
}