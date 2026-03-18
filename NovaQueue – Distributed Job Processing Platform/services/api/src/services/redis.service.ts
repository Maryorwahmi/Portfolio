/**
 * Redis Service - Singleton pattern
 * Author: CaptainCode
 * 
 * Manages all Redis connections and operations for queues, pub/sub, and caching
 */

import { createClient, RedisClientType } from 'redis';
import { Logger } from '@shared/utils';
import { JobMessage, JobEvent } from '@shared/types';

export class RedisService {
  private static instance: RedisService;
  private client: RedisClientType;
  private pubClient: RedisClientType;
  private subClient: RedisClientType;
  private logger = new Logger('RedisService');

  private constructor() {
    const redisUrl = `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
    
    this.client = createClient({ url: redisUrl });
    this.pubClient = createClient({ url: redisUrl });
    this.subClient = createClient({ url: redisUrl });
  }

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      await this.pubClient.connect();
      await this.subClient.connect();
      this.logger.info('Connected to Redis');
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  async ping(): Promise<string> {
    try {
      const result = await this.client.ping();
      this.logger.info('Redis ping successful');
      return result;
    } catch (error) {
      this.logger.error('Redis ping failed', error);
      throw error;
    }
  }

  /**
   * Push job to queue
   */
  async pushToQueue(queueName: string, job: JobMessage): Promise<void> {
    try {
      const key = `queue:${queueName}`;
      await this.client.lPush(key, JSON.stringify(job));
      this.logger.debug(`Job pushed to queue: ${queueName}`);
    } catch (error) {
      this.logger.error(`Failed to push job to queue: ${queueName}`, error);
      throw error;
    }
  }

  /**
   * Pop job from queue
   */
  async popFromQueue(queueName: string): Promise<JobMessage | null> {
    try {
      const key = `queue:${queueName}`;
      const data = await this.client.rPop(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Failed to pop from queue: ${queueName}`, error);
      throw error;
    }
  }

  /**
   * Get queue length
   */
  async getQueueLength(queueName: string): Promise<number> {
    try {
      const key = `queue:${queueName}`;
      return await this.client.lLen(key);
    } catch (error) {
      this.logger.error(`Failed to get queue length: ${queueName}`, error);
      throw error;
    }
  }

  /**
   * Move job to DLQ
   */
  async moveToDeadLetterQueue(jobId: string, jobMessage: JobMessage, reason: string): Promise<void> {
    try {
      const dlqKey = 'dlq:jobs';
      await this.client.lPush(dlqKey, JSON.stringify({
        ...jobMessage,
        reason,
        movedAt: new Date().toISOString()
      }));
      this.logger.info(`Job ${jobId} moved to DLQ`);
    } catch (error) {
      this.logger.error(`Failed to move job to DLQ: ${jobId}`, error);
      throw error;
    }
  }

  /**
   * Set job in processing
   */
  async setJobProcessing(jobId: string, workerId: string): Promise<void> {
    try {
      const key = `job:processing:${jobId}`;
      await this.client.setEx(key, 3600, JSON.stringify({
        workerId,
        startedAt: new Date().toISOString()
      }));
    } catch (error) {
      this.logger.error(`Failed to set job processing: ${jobId}`, error);
      throw error;
    }
  }

  /**
   * Publish job event
   */
  async publishJobEvent(event: JobEvent): Promise<void> {
    try {
      const channel = `jobs:${event.jobId}`;
      await this.pubClient.publish(channel, JSON.stringify(event));
      this.logger.debug(`Event published: ${event.event} for job ${event.jobId}`);
    } catch (error) {
      this.logger.error(`Failed to publish job event`, error);
    }
  }

  /**
   * Subscribe to job events
   */
  async subscribeToJobEvents(jobId: string, callback: (event: JobEvent) => void): Promise<void> {
    try {
      const channel = `jobs:${jobId}`;
      await this.subClient.subscribe(channel, (event) => {
        try {
          callback(JSON.parse(event));
        } catch (error) {
          this.logger.error('Failed to parse job event', error);
        }
      });
    } catch (error) {
      this.logger.error(`Failed to subscribe to job events: ${jobId}`, error);
    }
  }

  /**
   * Set cache value
   */
  async setCache(key: string, value: any, expirySeconds: number = 3600): Promise<void> {
    try {
      const cacheKey = `cache:${key}`;
      await this.client.setEx(cacheKey, expirySeconds, JSON.stringify(value));
    } catch (error) {
      this.logger.error(`Failed to set cache: ${key}`, error);
    }
  }

  /**
   * Get cache value
   */
  async getCache(key: string): Promise<any> {
    try {
      const cacheKey = `cache:${key}`;
      const data = await this.client.get(cacheKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Failed to get cache: ${key}`, error);
      return null;
    }
  }

  /**
   * Delete key
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key: ${key}`, error);
    }
  }

  /**
   * Acquire distributed lock
   */
  async acquireLock(key: string, ttlSeconds: number = 10): Promise<boolean> {
    try {
      const lockKey = `lock:${key}`;
      const result = await this.client.set(lockKey, '1', {
        EX: ttlSeconds,
        NX: true
      });
      return result !== null;
    } catch (error) {
      this.logger.error(`Failed to acquire lock: ${key}`, error);
      return false;
    }
  }

  /**
   * Release lock
   */
  async releaseLock(key: string): Promise<void> {
    try {
      const lockKey = `lock:${key}`;
      await this.client.del(lockKey);
    } catch (error) {
      this.logger.error(`Failed to release lock: ${key}`, error);
    }
  }

  /**
   * Get all jobs from queue (for monitoring)
   */
  async getAllQueueJobs(queueName: string, limit: number = 100): Promise<JobMessage[]> {
    try {
      const key = `queue:${queueName}`;
      const jobs = await this.client.lRange(key, 0, limit - 1);
      return jobs.map(job => JSON.parse(job));
    } catch (error) {
      this.logger.error(`Failed to get queue jobs: ${queueName}`, error);
      return [];
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      await this.pubClient.quit();
      await this.subClient.quit();
      this.logger.info('Disconnected from Redis');
    } catch (error) {
      this.logger.error('Error disconnecting from Redis', error);
    }
  }
}
