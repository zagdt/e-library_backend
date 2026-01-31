import pino, { Logger } from 'pino';
import { config } from '../../config/index.js';

const isDevelopment = config.env === 'development';

const baseLogger: Logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: config.env,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      baseLogger.info(data, message);
    } else {
      baseLogger.info(message);
    }
  },
  error: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      baseLogger.error(data, message);
    } else {
      baseLogger.error(message);
    }
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      baseLogger.warn(data, message);
    } else {
      baseLogger.warn(message);
    }
  },
  debug: (message: string, data?: Record<string, unknown>) => {
    if (data) {
      baseLogger.debug(data, message);
    } else {
      baseLogger.debug(message);
    }
  },
};

export const createChildLogger = (context: Record<string, unknown>) => {
  const child = baseLogger.child(context);
  return {
    info: (message: string, data?: Record<string, unknown>) => {
      if (data) {
        child.info(data, message);
      } else {
        child.info(message);
      }
    },
    error: (message: string, data?: Record<string, unknown>) => {
      if (data) {
        child.error(data, message);
      } else {
        child.error(message);
      }
    },
    warn: (message: string, data?: Record<string, unknown>) => {
      if (data) {
        child.warn(data, message);
      } else {
        child.warn(message);
      }
    },
    debug: (message: string, data?: Record<string, unknown>) => {
      if (data) {
        child.debug(data, message);
      } else {
        child.debug(message);
      }
    },
  };
};

export default logger;
