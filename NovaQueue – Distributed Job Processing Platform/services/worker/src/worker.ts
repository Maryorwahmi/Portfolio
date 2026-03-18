/**
 * Worker Process
 * Author: CaptainCode
 * 
 * Core worker that polls queues and processes jobs
 */

import { Logger, generateRequestId, getBackoffDelay } from '@shared/utils';
import { Job, JobStatus, JobHandler, JobMessage, JobQueueType } from '@shared/types';
import { createClient, RedisClientType } from 'redis';
import { Pool } from 'pg';

export class WorkerProcess {
  private id: string;
  private logger: Logger;
  private redisClient: RedisClientType;
  private dbPool: Pool;
  private isStopping = false;
  private activeJobs = 0;
  private totalJobs = 0;
  private successCount = 0;
  private failureCount = 0;
  private handlers = new Map<string, JobHandler>();
  private concurrency: number;

  constructor(
    id: string,
    concurrency: number = parseInt(process.env.WORKER_CONCURRENCY || '10')
  ) {
    this.id = id;
    this.logger = new Logger(`Worker-${id.substring(0, 8)}`);
    this.concurrency = concurrency;

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

    this.logger.info(`Worker initialized with concurrency: ${concurrency}`);
  }

  /**
   * Register a job handler
   */
  registerHandler(jobType: string, handler: JobHandler): void {
    this.handlers.set(jobType, handler);
    this.logger.info(`Handler registered for job type: ${jobType}`);
  }

  /**
   * Start worker loop
   */
  async start(): Promise<void> {
    try {
      await this.redisClient.connect();
      this.logger.info('✅ Connected to Redis');

      // Heartbeat
      this.startHeartbeat();

      // Start polling
      this.pollLoop();

      this.logger.info(`🎯 Worker started (ID: ${this.id})`);
    } catch (error) {
      this.logger.error('Failed to start worker', error);
      throw error;
    }
  }

  /**
   * Main polling loop
   */
  private async pollLoop(): Promise<void> {
    const pollInterval = parseInt(process.env.WORKER_POLL_INTERVAL || '1000');

    while (!this.isStopping) {
      try {
        // Only poll if below concurrency limit
        if (this.activeJobs < this.concurrency) {
          await this.pollQueues();
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        this.logger.error('Error in poll loop', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Poll all queues for jobs
   */
  private async pollQueues(): Promise<void> {
    const queues: JobQueueType[] = ['critical', 'high_priority', 'default', 'low_priority'];

    for (const queue of queues) {
      if (this.activeJobs >= this.concurrency) {
        break;
      }

      try {
        const job = await this.popJob(queue);

        if (job) {
          // Process job asynchronously
          this.processJobAsync(job);
          break; // Poll again to prioritize higher priority queues
        }
      } catch (error) {
        this.logger.error(`Error polling queue: ${queue}`, error);
      }
    }
  }

  /**
   * Pop job from queue
   */
  private async popJob(queueName: string): Promise<JobMessage | null> {
    try {
      const key = `queue:${queueName}`;
      const data = await this.redisClient.rPop(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Failed to pop from queue: ${queueName}`, error);
      return null;
    }
  }

  /**
   * Process job (non-blocking)
   */
  private async processJobAsync(jobMessage: JobMessage): Promise<void> {
    this.activeJobs++;
    this.totalJobs++;

    try {
      // Get full job details from database
      const job = await this.getJobFromDb(jobMessage.jobId);

      if (!job) {
        this.logger.warn(`Job not found in database: ${jobMessage.jobId}`);
        this.activeJobs--;
        return;
      }

      // Update status to processing
      await this.updateJobStatus(job.id, JobStatus.PROCESSING, this.id);

      this.logger.debug(`Processing job: ${job.id} (Type: ${job.type})`);

      // Get handler
      const handler = this.handlers.get(job.type);

      if (!handler) {
        throw new Error(`No handler registered for job type: ${job.type}`);
      }

      // Process with timeout
      const startTime = Date.now();
      const timeout = 30000; // 30 seconds

      const result = await Promise.race([
        handler.handle(job),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Job execution timeout')), timeout)
        )
      ]);

      const elapsed = Date.now() - startTime;

      // Mark as completed
      await this.updateJobStatus(job.id, JobStatus.COMPLETED, this.id, {
        executionTimeMs: elapsed
      });

      this.successCount++;
      this.logger.info(`✅ Job completed: ${job.id} (${elapsed}ms)`);
    } catch (error) {
      await this.handleJobFailure(jobMessage, error as Error);
    } finally {
      this.activeJobs--;
    }
  }

  /**
   * Handle job failure with retry logic
   */
  private async handleJobFailure(jobMessage: JobMessage, error: Error): Promise<void> {
    try {
      const job = await this.getJobFromDb(jobMessage.jobId);

      if (!job) {
        return;
      }

      const maxRetries = jobMessage.maxRetries || 3;
      const currentRetries = jobMessage.retries || 0;

      if (currentRetries < maxRetries) {
        // Retry
        const attemptNumber = currentRetries + 1;
        const delay = getBackoffDelay(attemptNumber);

        this.logger.info(
          `Job failed, retrying: ${job.id} (Attempt ${attemptNumber}/${maxRetries}, delay: ${delay}ms)`
        );

        // Update status to retrying
        await this.updateJobStatus(job.id, JobStatus.RETRYING, this.id, {
          lastError: error.message
        });

        // Re-queue with updated retry count
        await new Promise(resolve => setTimeout(resolve, delay));

        const updatedMessage = {
          ...jobMessage,
          retries: attemptNumber
        };

        await this.redisClient.lPush(`queue:${job.queue}`, JSON.stringify(updatedMessage));
      } else {
        // Move to DLQ
        this.logger.error(
          `Job exhausted retries, moving to DLQ: ${job.id} (Error: ${error.message})`
        );

        await this.updateJobStatus(job.id, JobStatus.FAILED, this.id, {
          lastError: error.message,
          failedAt: new Date()
        });

        await this.redisClient.lPush(
          'dlq:jobs',
          JSON.stringify({
            ...jobMessage,
            error: error.message,
            movedAt: new Date().toISOString()
          })
        );
      }

      this.failureCount++;
    } catch (error) {
      this.logger.error('Error handling job failure', error);
    }
  }

  /**
   * Get job from database
   */
  private async getJobFromDb(jobId: string): Promise<Job | null> {
    try {
      const result = await this.dbPool.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
      return result.rows.length > 0 ? this.mapRowToJob(result.rows[0]) : null;
    } catch (error) {
      this.logger.error(`Failed to get job from DB: ${jobId}`, error);
      return null;
    }
  }

  /**
   * Update job status
   */
  private async updateJobStatus(
    jobId: string,
    status: JobStatus,
    workerId?: string,
    data?: any
  ): Promise<void> {
    try {
      const updates: string[] = ['status = $2', 'updated_at = $3'];
      const values: any[] = [jobId, status, new Date()];
      let paramCount = 4;

      if (workerId) {
        updates.push(`worker_instance_id = $${paramCount}`);
        values.push(workerId);
        paramCount++;
      }

      if (data?.lastError) {
        updates.push(`last_error = $${paramCount}`);
        values.push(data.lastError);
        paramCount++;
      }

      if (data?.executionTimeMs) {
        updates.push(`execution_time_ms = $${paramCount}`);
        values.push(data.executionTimeMs);
        paramCount++;
      }

      const query = `UPDATE jobs SET ${updates.join(', ')} WHERE id = $1`;
      await this.dbPool.query(query, values);
    } catch (error) {
      this.logger.error(`Failed to update job status: ${jobId}`, error);
    }
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    setInterval(() => {
      this.logger.debug(`[Heartbeat] Active: ${this.activeJobs}, Total: ${this.totalJobs}`);
    }, 30000);
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
   * Stop worker gracefully
   */
  async stop(): Promise<void> {
    this.logger.info('Stopping worker...');
    this.isStopping = true;

    // Wait for active jobs to complete (with timeout)
    let attempts = 0;
    while (this.activeJobs > 0 && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    await this.redisClient.quit();
    await this.dbPool.end();
    this.logger.info('Worker stopped');
  }
}
