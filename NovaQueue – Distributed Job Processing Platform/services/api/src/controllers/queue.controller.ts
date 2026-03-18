/**
 * Queue Controller
 * Author: CaptainCode
 * 
 * Handles queue monitoring and statistics endpoints
 */

import { Request, Response } from 'express';
import { Logger } from '@shared/utils';
import { RedisService } from '../services/redis.service';
import { DatabaseService } from '../services/database.service';
import { MetricsService } from '../services/metrics.service';
import { JobQueueType } from '@shared/types';

export class QueueController {
  private redis = RedisService.getInstance();
  private db = DatabaseService.getInstance();
  private metrics = MetricsService.getInstance();
  private logger = new Logger('QueueController');

  /**
   * GET /queues - Get all queue statistics
   */
  async getQueueStats(req: Request, res: Response): Promise<void> {
    try {
      const queueNames: JobQueueType[] = [
        'default',
        'high_priority',
        'low_priority',
        'critical'
      ];

      const queueStats = await Promise.all(
        queueNames.map(async (name) => (
          {
            name,
            pending: await this.redis.getQueueLength(name),
            dlq: await this.redis.getQueueLength('dlq:jobs')
          }
        ))
      );

      const systemStats = await this.db.getSystemStats();

      res.json({
        success: true,
        data: {
          queues: queueStats,
          system: systemStats,
          metrics: this.metrics.getMetrics()
        },
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });

    } catch (error) {
      this.logger.error('Failed to get queue stats', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });
    }
  }

  /**
   * GET /queues/:name - Get specific queue details
   */
  async getQueueDetail(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const length = await this.redis.getQueueLength(name);
      const jobs = await this.redis.getAllQueueJobs(name, 20);

      res.json({
        success: true,
        data: {
          name,
          length,
          jobs,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });

    } catch (error) {
      this.logger.error('Failed to get queue detail', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });
    }
  }

  /**
   * GET /dlq - Get Dead Letter Queue
   */
  async getDeadLetterQueue(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const dlqJobs = await this.redis.getAllQueueJobs('dlq:jobs', limit);

      res.json({
        success: true,
        data: {
          dlq: dlqJobs,
          count: dlqJobs.length
        },
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });

    } catch (error) {
      this.logger.error('Failed to get DLQ', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });
    }
  }
}
