// src/modules/discovery/sources/doab.client.ts - UPDATED
import axios from 'axios';
import { BaseDiscoverySource } from './base.source.js';
import type { DiscoveryResult, DiscoverySearchQuery } from '../types.js';
import { XMLParser } from 'fast-xml-parser';

export class DOABClient extends BaseDiscoverySource {
  name = 'doab' as const;
  private xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
  });

  async search({ q, page = 1, limit = 20 }: DiscoverySearchQuery) {
    try {
      // DOAB has a new JSON API endpoint
      const response = await axios.get('https://directory.doabooks.org/rest/search', {
        params: {
          query: q,
          expand: 'metadata',
          limit,
          offset: (page - 1) * limit,
        },
        headers: {
          'Accept': 'application/json',
        },
        timeout: 20000,
      });

      const items = response.data?.items || [];
      
      const results: DiscoveryResult[] = items.map((item: any) => {
        const metadata = item.expandedMetadata || item.metadata || {};
        
        return {
          id: `doab-${item.handle || item.id || Math.random().toString(36).substr(2, 9)}`,
          title: metadata['dc.title']?.[0]?.value || 'Untitled',
          authors: metadata['dc.contributor.author']?.map((a: any) => a.value) || [],
          abstract: metadata['dc.description.abstract']?.[0]?.value,
          publishedDate: metadata['dc.date.issued']?.[0]?.value?.slice(0, 4) || 
                        metadata['dc.date.copyright']?.[0]?.value?.slice(0, 4),
          source: this.name,
          url: item.link || 
               metadata['dc.identifier.uri']?.[0]?.value ||
               `https://directory.doabooks.org/handle/${item.handle}`,
          pdfUrl: metadata['dc.identifier.uri']?.find((uri: any) => 
            uri.value.includes('.pdf')
          )?.value || undefined,
          doi: metadata['dc.identifier.doi']?.[0]?.value,
          subjects: metadata['dc.subject']?.map((s: any) => s.value) || [],
        };
      });

      return {
        results,
        total: response.data?.total || 0,
      };
    } catch (error: any) {
      console.error(`DOAB API error: ${error.message}, trying OAI-PMH fallback`);
      return await this.oaiPmhSearch(q, page, limit);
    }
  }

  private async oaiPmhSearch(q: string, page: number, limit: number) {
    try {
      // OAI-PMH endpoint for DOAB
      const response = await axios.get('https://directory.doabooks.org/oai/request', {
        params: {
          verb: 'ListRecords',
          metadataPrefix: 'oai_dc',
          set: 'col_123456789_1', // DOAB collection
        },
        timeout: 30000,
      });

      // Parse XML response
      const parsed = this.xmlParser.parse(response.data);
      const records = parsed?.OAI_PMH?.ListRecords?.record || [];
      
      // Simple text search on available records
      const filteredRecords = records
        .filter((record: any) => {
          const title = record.metadata?.['oai_dc:dc']?.['dc:title']?.['#text'] || '';
          const desc = record.metadata?.['oai_dc:dc']?.['dc:description']?.['#text'] || '';
          const text = (title + ' ' + desc).toLowerCase();
          return text.includes(q.toLowerCase());
        })
        .slice((page - 1) * limit, page * limit);

      const results: DiscoveryResult[] = filteredRecords.map((record: any) => {
        const dc = record.metadata?.['oai_dc:dc'] || {};
        
        return {
          id: `doab-${record.header?.identifier?.replace('oai:directory.doabooks.org:', '')}`,
          title: dc['dc:title']?.['#text'] || 'Untitled',
          authors: Array.isArray(dc['dc:creator']) 
            ? dc['dc:creator'].map((c: any) => c['#text'])
            : dc['dc:creator']?.['#text'] ? [dc['dc:creator']['#text']] : [],
          abstract: dc['dc:description']?.['#text'],
          publishedDate: dc['dc:date']?.['#text']?.slice(0, 4),
          source: this.name,
          url: dc['dc:identifier']?.find((id: any) => 
            id['#text'] && !id['#text'].startsWith('oai:')
          )?.['#text'] || `https://directory.doabooks.org/handle/${record.header?.identifier?.split(':').pop()}`,
          pdfUrl: dc['dc:identifier']?.find((id: any) => 
            id['#text'] && id['#text'].includes('.pdf')
          )?.['#text'],
          subjects: Array.isArray(dc['dc:subject']) 
            ? dc['dc:subject'].map((s: any) => s['#text'])
            : dc['dc:subject']?.['#text'] ? [dc['dc:subject']['#text']] : [],
        };
      });

      return {
        results,
        total: records.length,
      };
    } catch (error: any) {
      console.error(`DOAB OAI-PMH error: ${error.message}`);
      return { results: [], total: 0 };
    }
  }

  async harvest(): Promise<void> {
    // Optional background harvest implementation
    // Could be used to periodically fetch new records
    console.log(`${this.name}: Harvest not implemented`);
  }
}