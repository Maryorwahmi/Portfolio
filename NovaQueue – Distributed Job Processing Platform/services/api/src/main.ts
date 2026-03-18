/**
 * NovaQueue API - Main Entry Point
 * Author: CaptainCode | Company: NovaCore Systems
 * 
 * Production-ready REST API for job submission, monitoring, and management
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Logger, generateRequestId } from '@shared/utils';
import { ApiResponse } from '@shared/types';
import { setupRoutes } from './routes';
import { initializeDatabase } from './database';
import { RedisService } from './services/redis.service';
import { MetricsService } from './services/metrics.service';

require('dotenv').config();

const logger = new Logger('API-Server');
const app: Express = express();
const PORT = parseInt(process.env.API_PORT || '3000');
const HOST = process.env.API_HOST || '0.0.0.0';

// ============================================
// MIDDLEWARE
// ============================================

// Request tracking middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = generateRequestId();
  logger.debug(`Incoming request: ${req.method} ${req.path}`, { requestId: req.id });
  
  const startTime = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - startTime;
    logger.debug(`Request completed`, { 
      requestId: req.id, 
      status: res.statusCode, 
      elapsed: `${elapsed}ms` 
    });
  });
  
  next();
});

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// GLOBAL RESPONSE WRAPPER
// ============================================

const originalJson = app.response.json;
app.response.json = function<T>(body?: T): Express.Response {
  const requestId = (this.req as any).id || generateRequestId();
  
  if (!body) {
    return originalJson.call(this, {
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
      requestId
    });
  }

  // If already wrapped, return as is
  if (body && typeof body === 'object' && 'success' in body) {
    return originalJson.call(this, body);
  }

  const response: ApiResponse<T> = {
    success: true,
    data: body,
    timestamp: new Date().toISOString(),
    requestId
  };

  return originalJson.call(this, response);
};

// ============================================
// ERROR HANDLING
// ============================================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).id || generateRequestId();
  logger.error('Unhandled error', err);
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    timestamp: new Date().toISOString(),
    requestId
  });
});

// ============================================
// LIFECYCLE HOOKS
// ============================================

async function bootstrap() {
  try {
    logger.info('🚀 Starting NovaQueue API Service...');
    logger.info('👨‍💻 Created with ❤️ by CaptainCode');
    logger.info('🏢 Company: NovaCore Systems');

    // Initialize services
    logger.info('Initializing Redis connection...');
    await RedisService.getInstance().ping();

    logger.info('Initializing database...');
    await initializeDatabase();

    logger.info('Starting metrics service...');
    MetricsService.getInstance().start();

    // Setup routes
    setupRoutes(app);

    // Health check
    app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        service: 'novaqueue-api',
        version: '2.0.0',
        author: 'CaptainCode',
        timestamp: new Date().toISOString()
      });
    });

    // Start server
    const server = app.listen(PORT, HOST, () => {
      logger.info(`✅ API server running on http://${HOST}:${PORT}`);
      logger.info(`📊 Health check: http://${HOST}:${PORT}/health`);
      logger.info(`📖 API Docs: http://${HOST}:${PORT}/api/docs`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await RedisService.getInstance().disconnect();
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start API service', error);
    process.exit(1);
  }
}

bootstrap();

export default app;
