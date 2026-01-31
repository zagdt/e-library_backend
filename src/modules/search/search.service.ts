import prisma from '../../config/database.js';
import { getRedisClient, isRedisConnected } from '../../config/redis.js';
import { logger } from '../../shared/utils/logger.js';
import type { SearchQueryInput } from './search.validators.js';

const CACHE_TTL = 180;

type SortByType = 'relevance' | 'createdAt' | 'downloadCount' | 'title';

export class SearchService {
  async search(query: SearchQueryInput, userId?: string) {
    const rawPage = (query as any).page ?? 1;
    const rawLimit = (query as any).limit ?? 20;

    const page = Number.isFinite(Number(rawPage)) && Number(rawPage) > 0
      ? Math.floor(Number(rawPage))
      : 1;
    const limit = Number.isFinite(Number(rawLimit)) && Number(rawLimit) > 0
      ? Math.floor(Number(rawLimit))
      : 20;

    const { q, cursor, category, department, year, tag, author, sortBy, sortOrder } = query;

    const cacheKey = `search:${JSON.stringify(query)}`;

    if (isRedisConnected()) {
      const cached = await getRedisClient().get(cacheKey);
      if (cached) {
        await this.logSearch(q, userId, JSON.parse(cached).data.length);
        return JSON.parse(cached);
      }
    }

    const searchTerms = q.toLowerCase().split(' ').filter(t => t.length > 0);

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (category) where.category = category;
    if (department) where.department = { contains: department, mode: 'insensitive' };
    if (year) where.publicationYear = year;
    if (tag) where.tags = { has: tag };
    if (author) where.authors = { hasSome: [author] };

    where.OR = searchTerms.map(term => ({
      OR: [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { department: { contains: term, mode: 'insensitive' } },
      ],
    }));

    let orderBy: Record<string, string> | Record<string, string>[];

    switch (sortBy as SortByType) {
      case 'downloadCount':
        orderBy = { downloadCount: sortOrder };
        break;
      case 'createdAt':
        orderBy = { createdAt: sortOrder };
        break;
      case 'title':
        orderBy = { title: sortOrder };
        break;
      case 'relevance':
      default:
        orderBy = [
          { downloadCount: 'desc' },
          { viewCount: 'desc' },
          { createdAt: 'desc' },
        ];
    }

    const skip = cursor ? undefined : (page - 1) * limit;

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where: where as any,
        take: limit + (cursor ? 1 : 0),
        skip,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: orderBy as any,
        select: {
          id: true,
          title: true,
          authors: true,
          description: true,
          category: true,
          department: true,
          publicationYear: true,
          tags: true,
          accessType: true,
          downloadCount: true,
          viewCount: true,
          createdAt: true,
          uploadedBy: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.resource.count({ where: where as any }),
    ]);

    await this.logSearch(q, userId, total);

    let result;

    if (cursor) {
      const hasMore = resources.length > limit;
      const data = hasMore ? resources.slice(0, -1) : resources;
      const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

      result = {
        data,
        pagination: {
          nextCursor,
          hasMore,
          total,
        },
      };
    } else {
      result = {
        data: resources,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    }

    if (isRedisConnected()) {
      await getRedisClient().setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    }

    return result;
  }

  async getTopSearchTerms(limit: number = 10) {
    const cacheKey = `top-searches:${limit}`;

    if (isRedisConnected()) {
      const cached = await getRedisClient().get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const searchLogs = await prisma.searchLog.groupBy({
      by: ['query'],
      _count: { query: true },
      where: {
        timestamp: { gte: thirtyDaysAgo },
      },
      orderBy: {
        _count: { query: 'desc' },
      },
      take: limit,
    });

    const result = searchLogs.map(log => ({
      query: log.query,
      count: log._count.query,
    }));

    if (isRedisConnected()) {
      await getRedisClient().setex(cacheKey, 300, JSON.stringify(result));
    }

    return result;
  }

  async getSuggestions(partial?: string, limit: number = 5) {
    const normalized = (partial ?? '').trim();

    if (normalized.length < 2) {
      return [];
    }

    const resources = await prisma.resource.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: normalized, mode: 'insensitive' } },
          { tags: { hasSome: [normalized] } },
        ],
      },
      select: {
        id: true,
        title: true,
        category: true,
      },
      take: limit,
    });

    return resources;
  }

  private async logSearch(query: string, userId?: string, resultsCount: number = 0) {
    try {
      await prisma.searchLog.create({
        data: {
          query: query.toLowerCase(),
          userId,
          resultsCount,
        },
      });
    } catch (error) {
      logger.error('Failed to log search', { error, query });
    }
  }
}

export const searchService = new SearchService();
