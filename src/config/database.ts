import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/utils/logger.js';
import {config} from '../config/index.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  return new PrismaClient({
    log: [
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
    datasources: {
      db: {
        url: config.database.url,
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

prisma.$connect()
  .then(() => {
    logger.info('Database connected successfully');
  })
  .catch((error: Error) => {
    logger.error('Database connection failed', { error: error.message });
    process.exit(1);
  });

export default prisma;
