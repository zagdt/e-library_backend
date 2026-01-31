import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from '../../config/redis.js';
import prisma from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';

const QUEUE_NAME = 'analytics-queue';

interface AnalyticsJobData {
  type: 'daily_aggregation' | 'cleanup_tokens';
  date?: string;
}

let analyticsQueue: Queue<AnalyticsJobData> | null = null;
let analyticsWorker: Worker<AnalyticsJobData> | null = null;

const getAnalyticsQueue = (): Queue<AnalyticsJobData> | null => {
  if (!analyticsQueue) {
    analyticsQueue = new Queue<AnalyticsJobData>(QUEUE_NAME, {
      connection: getRedisClient(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    });
  }

  return analyticsQueue;
};

const processAnalyticsJob = async (job: Job<AnalyticsJobData>): Promise<void> => {
  const { type, date } = job.data;
  logger.info('Processing analytics job', { jobId: job.id, type });

  try {
    switch (type) {
      case 'daily_aggregation': {
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const [downloads, searches, topSearchTerms, topResources, usersByRole] = await Promise.all([
          prisma.downloadLog.count({
            where: {
              timestamp: { gte: targetDate, lt: nextDay },
            },
          }),
          prisma.searchLog.count({
            where: {
              timestamp: { gte: targetDate, lt: nextDay },
            },
          }),
          prisma.searchLog.groupBy({
            by: ['query'],
            _count: { query: true },
            where: {
              timestamp: { gte: targetDate, lt: nextDay },
            },
            orderBy: { _count: { query: 'desc' } },
            take: 20,
          }),
          prisma.resource.findMany({
            where: {
              downloadLogs: {
                some: {
                  timestamp: { gte: targetDate, lt: nextDay },
                },
              },
            },
            select: {
              id: true,
              title: true,
              _count: {
                select: { downloadLogs: true },
              },
            },
            orderBy: {
              downloadLogs: { _count: 'desc' },
            },
            take: 20,
          }),
          prisma.user.groupBy({
            by: ['role'],
            _count: { role: true },
          }),
        ]);

        await prisma.analytics.upsert({
          where: { date: targetDate },
          update: {
            totalDownloads: downloads,
            totalSearches: searches,
            topSearchTerms: topSearchTerms.map(t => ({ query: t.query, count: t._count.query })),
            topResources: topResources.map(r => ({ id: r.id, title: r.title, downloads: r._count.downloadLogs })),
            usersByRole: Object.fromEntries(usersByRole.map(u => [u.role, u._count.role])),
          },
          create: {
            date: targetDate,
            totalDownloads: downloads,
            totalSearches: searches,
            topSearchTerms: topSearchTerms.map(t => ({ query: t.query, count: t._count.query })),
            topResources: topResources.map(r => ({ id: r.id, title: r.title, downloads: r._count.downloadLogs })),
            usersByRole: Object.fromEntries(usersByRole.map(u => [u.role, u._count.role])),
          },
        });

        logger.info('Daily analytics aggregation completed', { date: targetDate.toISOString() });
        break;
      }

      case 'cleanup_tokens': {
        const result = await prisma.blacklistedToken.deleteMany({
          where: {
            expiresAt: { lt: new Date() },
          },
        });

        logger.info('Expired tokens cleaned up', { count: result.count });
        break;
      }

      default:
        logger.error('Unknown analytics job type', { type });
    }
  } catch (error) {
    logger.error('Analytics job failed', { jobId: job.id, type, error });
    throw error;
  }
};

export const startAnalyticsWorker = (): void => {
  if (!analyticsWorker) {
    const connection = getRedisClient();
    analyticsWorker = new Worker<AnalyticsJobData>(QUEUE_NAME, processAnalyticsJob, {
      connection,
      concurrency: 3,
    });

    analyticsWorker.on('completed', (job) => {
      logger.info('Analytics job completed', { jobId: job.id });
    });

    analyticsWorker.on('failed', (job, error) => {
      logger.error('Analytics job failed', { jobId: job?.id, error: error.message });
    });

    logger.info('Analytics worker started');
  }
};

export const stopAnalyticsWorker = async (): Promise<void> => {
  if (analyticsWorker) {
    await analyticsWorker.close();
    analyticsWorker = null;
  }
  if (analyticsQueue) {
    await analyticsQueue.close();
    analyticsQueue = null;
  }
};

export const scheduleAnalytics = {
  scheduleDailyAggregation: async (date?: string): Promise<void> => {
    const queue = getAnalyticsQueue();
    if (queue) {
      await queue.add('daily_aggregation', { type: 'daily_aggregation', date });
    }
  },

  scheduleTokenCleanup: async (): Promise<void> => {
    const queue = getAnalyticsQueue();
    if (queue) {
      await queue.add('cleanup_tokens', { type: 'cleanup_tokens' });
    }
  },
};
