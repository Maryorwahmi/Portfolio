/**
 * Scheduler Service
 * Author: CaptainCode
 * 
 * Processes delayed and cron-scheduled jobs
 */

import { Logger } from '@shared/utils';
import { Job, JobStatus } from '@shared/types';
import { createClient, RedisClientType } from 'redis';
import { Pool } from 'pg';

export class SchedulerService {
  private logger = new Logger('SchedulerService');
  private redisClient: RedisClientType;
  private dbPool: Pool;
  private isStopping = false;
  private lastRunTime = 0;
  private processedCount = 0;

  constructor() {
    // Initialize Redis
    const redisUrl = `redis://${process.env.REDIS_HOST || 'localhost'}:${
      process.env.REDIS_PORT || 6379
    }`;
    this.redisClient = createClient({ url: redisUrl });

    // Initialize Database
    this.dbPool = new Pool({
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'novaqueue',
      user: process.env.DATABASE_USER || 'novaqueue_user',
      password: process.env.DATABASE_PASSWORD || '',
      max: 5
    });
  }

  /**
   * Start scheduler
   */
  async start(): Promise<void> {
    try {
      await this.redisClient.connect();
      this.logger.info('✅ Connected to Redis');

      this.schedulerLoop();
      this.logger.info('🎯 Scheduler started');
    } catch (error) {
      this.logger.error('Failed to start scheduler', error);
      throw error;
    }
  }

  /**
   * Main scheduler loop
   */
  private async schedulerLoop(): Promise<void> {
    const interval = parseInt(process.env.SCHEDULER_INTERVAL || '10000');

    while (!this.isStopping) {
      try {
        const start = Date.now();
        await this.processScheduledJobs();
        const elapsed = Date.now() - start;

        this.lastRunTime = elapsed;
        this.logger.debug(`Scheduler run completed in ${elapsed}ms (Processed: ${this.processedCount})`);

        // Wait before next run
        const waitTime = Math.max(interval - elapsed, 1000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } catch (error) {
        this.logger.error('Error in scheduler loop', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Process pending scheduled jobs
   */
  private async processScheduledJobs(): Promise<void> {
    const batchSize = 100;

    try {
      const jobs = await this.getPendingScheduledJobs(batchSize);

      if (jobs.length === 0) {
        return;
      }

      this.logger.debug(`Processing ${jobs.length} scheduled jobs`);

      for (const job of jobs) {
        try {
          await this.processJob(job);
          this.processedCount++;
        } catch (error) {
          this.logger.error(`Failed to process scheduled job: ${job.id}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to process scheduled jobs', error);
    }
  }

  /**
   * Get pending scheduled jobs
   */
  private async getPendingScheduledJobs(limit: number): Promise<Job[]> {
    const query = `
      SELECT * FROM jobs 
      WHERE status = $1
      AND (
        (delay > 0 AND created_at + (delay || ' milliseconds')::interval <= now())
        OR
        (scheduled_at IS NOT NULL AND scheduled_at <= now())
      )
      LIMIT $2;
    `;

    try {
      const result = await this.dbPool.query(query, [JobStatus.DELAYED, limit]);
      return result.rows.map(row => this.mapRowToJob(row));
    } catch (error) {
      this.logger.error('Failed to get pending scheduled jobs', error);
      return [];
    }
  }

  /**
   * Process a scheduled job
   */
  private async processJob(job: Job): Promise<void> {
    try {
      // Update status to pending
      await this.dbPool.query(
        'UPDATE jobs SET status = $1, updated_at = $2 WHERE id = $3',
        [JobStatus.PENDING, new Date(), job.id]
      );

      // Push to queue
      await this.redisClient.lPush(
        `queue:${job.queue}`,
        JSON.stringify({
          jobId: job.id,
          type: job.type,
          payload: job.payload,
          priority: job.priority,
          retries: job.retries,
          maxRetries: job.maxRetries,
          metadata: job.metadata,
          timestamp: Date.now()
        })
      );

      this.logger.debug(`Scheduled job queued: ${job.id}`);

      // Handle cron jobs (recreate if cron is set)
      if (job.cron) {
        await this.scheduleNextCronRun(job);
      }
    } catch (error) {
      this.logger.error(`Failed to process scheduled job: ${job.id}`, error);
      throw error;
    }
  }

  /**
   * Schedule next cron run
   */
  private async scheduleNextCronRun(job: Job): Promise<void> {
    try {
      // Simple cron scheduling - just add 24 hours for now
      // In production, use a proper cron parser library
      const nextRun = new Date();
      nextRun.setHours(nextRun.getHours() + 24);

      await this.dbPool.query(
        'UPDATE jobs SET scheduled_at = $1, updated_at = $2 WHERE id = $3 AND cron IS NOT NULL',
        [nextRun, new Date(), job.id]
      );

      this.logger.debug(`Next cron run scheduled for job: ${job.id} at ${nextRun.toISOString()}`);
    } catch (error) {
      this.logger.error(`Failed to schedule next cron run: ${job.id}`, error);
    }
  }

  /**
   * Map database row to Job object
   */
  private mapRowToJob(row: any): Job {
    return {
      id: row.id,
      type: row.type,
      payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
      priority: row.priority,
      status: row.status,
      queue: row.queue,
      retries: row.retries,
      maxRetries: row.max_retries,
      delay: row.delay,
      scheduledAt: row.scheduled_at,
      cron: row.cron,
      processedAt: row.processed_at,
      completedAt: row.completed_at,
      failedAt: row.failed_at,
      lastError: row.last_error,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      workerInstanceId: row.worker_instance_id,
      executionTimeMs: row.execution_time_ms
    };
  }

  /**
   * Stop scheduler
   */
  async stop(): Promise<void> {
    this.logger.info('Stopping scheduler...');
    this.isStopping = true;

    await this.redisClient.quit();
    await this.dbPool.end();
    this.logger.info('Scheduler stopped');
  }
}
