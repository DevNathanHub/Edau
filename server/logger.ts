import winston from 'winston';
import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'edau-farm-api' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// If we're not in production then log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Morgan stream for HTTP request logging
const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Morgan middleware configuration
const morganMiddleware = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms',
  {
    stream: morganStream,
    skip: (req: any, res: any) => {
      // Skip health check logs in production
      return process.env.NODE_ENV === 'production' && req.url === '/api/health';
    }
  }
);

// Performance monitoring
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordMetric(endpoint: string, duration: number): void {
    const existing = this.metrics.get(endpoint) || { count: 0, totalTime: 0, avgTime: 0 };
    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    this.metrics.set(endpoint, existing);
  }

  getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [endpoint, data] of this.metrics.entries()) {
      result[endpoint] = {
        requests: data.count,
        avgResponseTime: Math.round(data.avgTime * 100) / 100,
        totalTime: Math.round(data.totalTime * 100) / 100
      };
    }
    return result;
  }

  reset(): void {
    this.metrics.clear();
  }
}

const performanceMonitor = PerformanceMonitor.getInstance();

// Request timing middleware
const requestTimer = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds

    // Record performance metric
    performanceMonitor.recordMetric((req as any).route?.path || (req as any).path, duration);

    // Log slow requests
    if (duration > 1000) { // More than 1 second
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        userAgent: req.get('User-Agent'),
        ip: (req as any).ip
      });
    }
  });

  next();
};

export {
  logger,
  morganMiddleware,
  performanceMonitor,
  requestTimer
};