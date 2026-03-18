/**
 * Database Service
 * Author: CaptainCode
 * 
 * PostgreSQL connection management and job persistence
 */

import { Pool, PoolClient } from 'pg';
import { Logger } from '@shared/utils';
import { Job, JobStatus } from '@shared/types';

export class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool;
  private logger = new Logger('DatabaseService');

  private constructor() {
    this.pool = new Pool({
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'novaqueue',
      user: process.env.DATABASE_USER || 'novaqueue_user',
      password: process.env.DATABASE_PASSWORD || '',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle client', err);
    });
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      client.release();
      this.logger.info('Connected to PostgreSQL');
    } catch (error) {
      this.logger.error('Failed to connect to PostgreSQL', error);
      throw error;
    }
  }

  /**
   * Get a client from the pool
   */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Create a new job
   */
  async createJob(job: Job): Promise<Job> {
    const query = `
      INSERT INTO jobs (
        id, type, payload, status, priority, queue, retries, max_retries,
        delay, scheduled_at, cron, metadata, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
      RETURNING *;
    `;

    try {
      const result = await this.pool.query(query, [
        job.id,
        job.type,
        JSON.stringify(job.payload),
        job.status,
        job.priority,
        job.queue,
        job.retries || 0,
        job.maxRetries || 3,
        job.delay || 0,
        job.scheduledAt || null,
        job.cron || null,
        JSON.stringify(job.metadata || {}),
        job.createdAt,
        job.updatedAt
      ]);

      this.logger.debug(`Job created: ${job.id}`);
      return this.mapRowToJob(result.rows[0]);
    } catch (error) {
      this.logger.error(`Failed to create job: ${job.id}`, error);
      throw error;
    }
  }

  /**
   * Get job by ID
   */
  async getJobById(jobId: string): Promise<Job | null> {
    const query = 'SELECT * FROM jobs WHERE id = $1;';

    try {
      const result = await this.pool.query(query, [jobId]);
      return result.rows.length > 0 ? this.mapRowToJob(result.rows[0]) : null;
    } catch (error) {
      this.logger.error(`Failed to get job: ${jobId}`, error);
      throw error;
    }
  }

  /**
   * Update job status
   */
  async updateJobStatus(jobId: string, status: JobStatus, data?: any): Promise<void> {
    const updates: string[] = ['status = $2', 'updated_at = $3'];
    const values: any[] = [jobId, status, new Date()];
    let paramCount = 4;

    if (data?.lastError) {
      updates.push(`last_error = $${paramCount}`);
      values.push(data.lastError);
      paramCount++;
    }

    if (data?.completedAt) {
      updates.push(`completed_at = $${paramCount}`);
      values.push(data.completedAt);
      paramCount++;
    }

    if (data?.processedAt) {
      updates.push(`processed_at = $${paramCount}`);
      values.push(data.processedAt);
      paramCount++;
    }

    if (data?.executionTimeMs !== undefined) {
      updates.push(`execution_time_ms = $${paramCount}`);
      values.push(data.executionTimeMs);
      paramCount++;
    }

    if (data?.workerInstanceId) {
      updates.push(`worker_instance_id = $${paramCount}`);
      values.push(data.workerInstanceId);
      paramCount++;
    }

    const query = `UPDATE jobs SET ${updates.join(', ')} WHERE id = $1;`;

    try {
      await this.pool.query(query, values);
      this.logger.debug(`Job status updated: ${jobId} -> ${status}`);
    } catch (error) {
      this.logger.error(`Failed to update job status: ${jobId}`, error);
      throw error;
    }
  }

  /**
   * Increment job retry count
   */
  async incrementRetries(jobId: string): Promise<number> {
    const query = `
      UPDATE jobs 
      SET retries = retries + 1, updated_at = $2
      WHERE id = $1
      RETURNING retries;
    `;

    try {
      const result = await this.pool.query(query, [jobId, new Date()]);
      return result.rows[0].retries;
    } catch (error) {
      this.logger.error(`Failed to increment retries: ${jobId}`, error);
      throw error;
    }
  }

  /**
   * Get jobs by status with pagination
   */
  async getJobsByStatus(
    status: JobStatus,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ jobs: Job[]; total: number }> {
    const countQuery = 'SELECT COUNT(*) as total FROM jobs WHERE status = $1;';
    const dataQuery = `
      SELECT * FROM jobs 
      WHERE status = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3;
    `;

    try {
      const countResult = await this.pool.query(countQuery, [status]);
      const dataResult = await this.pool.query(dataQuery, [status, limit, offset]);

      return {
        jobs: dataResult.rows.map(row => this.mapRowToJob(row)),
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      this.logger.error(`Failed to get jobs by status: ${status}`, error);
      throw error;
    }
  }

  /**
   * Get pending scheduled jobs
   */
  async getPendingScheduledJobs(): Promise<Job[]> {
    const query = `
      SELECT * FROM jobs 
      WHERE (cron IS NOT NULL OR scheduled_at IS NOT NULL)
      AND status = $1
      AND (scheduled_at IS NULL OR scheduled_at <= now())
      LIMIT 100;
    `;

    try {
      const result = await this.pool.query(query, ['delayed']);
      return result.rows.map(row => this.mapRowToJob(row));
    } catch (error) {
      this.logger.error('Failed to get pending scheduled jobs', error);
      throw error;
    }
  }

  /**
   * Log job event
   */
  async logJobEvent(jobId: string, status: JobStatus, message: string): Promise<void> {
    const query = `
      INSERT INTO job_logs (job_id, status, message, timestamp)
      VALUES ($1, $2, $3, $4);
    `;

    try {
      await this.pool.query(query, [jobId, status, message, new Date()]);
    } catch (error) {
      this.logger.error(`Failed to log job event: ${jobId}`, error);
    }
  }

  /**
   * Get job logs
   */
  async getJobLogs(jobId: string): Promise<any[]> {
    const query = `
      SELECT * FROM job_logs 
      WHERE job_id = $1 
      ORDER BY timestamp DESC 
      LIMIT 100;
    `;

    try {
      const result = await this.pool.query(query, [jobId]);
      return result.rows;
    } catch (error) {
      this.logger.error(`Failed to get job logs: ${jobId}`, error);
      return [];
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<any> {
    const query = `
      SELECT
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        AVG(EXTRACT(EPOCH FROM (completed_at - processed_at))) as avg_execution_time
      FROM jobs;
    `;

    try {
      const result = await this.pool.query(query);
      return result.rows[0];
    } catch (error) {
      this.logger.error('Failed to get system stats', error);
      throw error;
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

  async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.info('Disconnected from PostgreSQL');
    } catch (error) {
      this.logger.error('Error disconnecting from PostgreSQL', error);
    }
  }
}
