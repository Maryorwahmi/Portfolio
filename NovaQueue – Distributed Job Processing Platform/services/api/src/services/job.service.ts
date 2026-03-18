/**
 * Job Service
 * Author: CaptainCode
 * 
 * Core business logic for job management
 */

import { Logger, generateJobId, getQueueNameByPriority } from '@shared/utils';
import { Job, JobPriority, JobStatus, CreateJobRequest, JobQueueType } from '@shared/types';
import { DatabaseService } from './database.service';
import { RedisService } from './redis.service';

export class JobService {
  private static instance: JobService;
  private logger = new Logger('JobService');
  private db = DatabaseService.getInstance();
  private redis = RedisService.getInstance();
  private idempotencyCache = new Map<string, Job>();

  private constructor() {}

  static getInstance(): JobService {
    if (!JobService.instance) {
      JobService.instance = new JobService();
    }
    return JobService.instance;
  }

  /**
   * Create a new job
   */
  async createJob(request: CreateJobRequest): Promise<Job> {
    // Check idempotency
    if (request.idempotencyKey) {
      const cached = this.idempotencyCache.get(request.idempotencyKey);
      if (cached) {
        this.logger.info(`Idempotent job found: ${cached.id}`);
        return cached;
      }
    }

    const job: Job = {
      id: generateJobId(),
      type: request.type,
      payload: request.payload,
      priority: request.priority || JobPriority.MEDIUM,
      status: request.delay && request.delay > 0 ? JobStatus.DELAYED : JobStatus.PENDING,
      queue: getQueueNameByPriority(request.priority || JobPriority.MEDIUM) as JobQueueType,
      retries: 0,
      maxRetries: 3,
      delay: request.delay || 0,
      scheduledAt: request.scheduledAt,
      cron: request.cron,
      metadata: request.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      // Persist to database
      const createdJob = await this.db.createJob(job);

      // Push to Redis queue (unless delayed)
      if (!request.delay || request.delay === 0) {
        await this.redis.pushToQueue(job.queue, {
          jobId: job.id,
          type: job.type,
          payload: job.payload,
          priority: job.priority,
          retries: job.retries,
          maxRetries: job.maxRetries,
          metadata: job.metadata,
          timestamp: Date.now()
        });
      }

      // Cache for idempotency
      if (request.idempotencyKey) {
        this.idempotencyCache.set(request.idempotencyKey, createdJob);
        // TTL: 1 hour
        setTimeout(() => this.idempotencyCache.delete(request.idempotencyKey!), 3600000);
      }

      this.logger.info(`Job created: ${job.id} (Type: ${job.type}, Priority: ${job.priority})`);
      return createdJob;

    } catch (error) {
      this.logger.error(`Failed to create job`, error);
      throw error;
    }
  }

  /**
   * Get job details
   */
  async getJob(jobId: string): Promise<Job | null> {
    try {
      return await this.db.getJobById(jobId);
    } catch (error) {
      this.logger.error(`Failed to get job: ${jobId}`, error);
      throw error;
    }
  }

  /**
   * Get jobs with filtering and pagination
   */
  async getJobs(
    status?: JobStatus,
    type?: string,
    priority?: JobPriority,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ jobs: Job[]; total: number }> {
    try {
      if (status) {
        return await this.db.getJobsByStatus(status, limit, offset);
      }
      // TODO: Implement filtering by type and priority
      return { jobs: [], total: 0 };
    } catch (error) {
      this.logger.error('Failed to get jobs', error);
      throw error;
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    try {
      const job = await this.db.getJobById(jobId);
      
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) {
        throw new Error(`Cannot cancel job with status: ${job.status}`);
      }

      await this.db.updateJobStatus(jobId, JobStatus.CANCELLED);
      await this.db.logJobEvent(jobId, JobStatus.CANCELLED, 'Job cancelled by user');
      
      this.logger.info(`Job cancelled: ${jobId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel job: ${jobId}`, error);
      throw error;
    }
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<Job> {
    try {
      const job = await this.db.getJobById(jobId);
      
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      if (job.status !== JobStatus.FAILED) {
        throw new Error(`Can only retry failed jobs, current status: ${job.status}`);
      }

      // Re-queue the job
      await this.redis.pushToQueue(job.queue, {
        jobId: job.id,
        type: job.type,
        payload: job.payload,
        priority: job.priority,
        retries: job.retries,
        maxRetries: job.maxRetries,
        metadata: job.metadata,
        timestamp: Date.now()
      });

      await this.db.updateJobStatus(jobId, JobStatus.PENDING);
      await this.db.logJobEvent(jobId, JobStatus.PENDING, 'Job manually retried');

      this.logger.info(`Job retried: ${jobId}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to retry job: ${jobId}`, error);
      throw error;
    }
  }

  /**
   * Get job logs
   */
  async getJobLogs(jobId: string): Promise<any[]> {
    try {
      return await this.db.getJobLogs(jobId);
    } catch (error) {
      this.logger.error(`Failed to get job logs: ${jobId}`, error);
      throw error;
    }
  }

  /**
   * Get DLQ jobs
   */
  async getDeadLetterQueueJobs(limit: number = 50): Promise<any[]> {
    try {
      return await this.redis.getAllQueueJobs('dlq:jobs', limit);
    } catch (error) {
      this.logger.error('Failed to get DLQ jobs', error);
      return [];
    }
  }
}
