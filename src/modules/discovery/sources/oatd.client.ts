// src/modules/discovery/sources/oatd.client.ts
import axios from 'axios';
import { BaseDiscoverySource } from './base.source.js';
import type { DiscoveryResult, DiscoverySearchQuery } from '../types.js';

export class OATDClient extends BaseDiscoverySource {
  name = 'oatd' as const;

  async search({ q, page = 1, limit = 20 }: DiscoverySearchQuery) {
    const start = (page - 1) * limit;
    const url = `http://www.oatd.org/oatd/searchjson?q=${encodeURIComponent(q)}&start=${start}&rows=${limit}`;

    const { data } = await axios.get(url, { timeout: 10000 });

    const results: DiscoveryResult[] = data.docs.map((doc: any) => ({
      id: `oatd-${doc.id}`,
      title: doc.title || 'No title',
      authors: doc.author_name,
      abstract: doc.abstract,
      publishedDate: doc.pubdate,
      source: this.name,
      url: doc.url,
      doi: doc.doi?.[0],
      pdfUrl: doc.pdf_url,
      subjects: doc.subject,
    }));

    return { results, total: data.numFound || 0 };
  }

  async harvest(): Promise<void> {
    // Optional background harvest implementation
    // Could be used to periodically fetch new records
    console.log(`${this.name}: Harvest not implemented`);
  }
}