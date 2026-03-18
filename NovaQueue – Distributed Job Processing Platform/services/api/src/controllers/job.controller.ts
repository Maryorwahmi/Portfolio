/**
 * Job Controller
 * Author: CaptainCode
 * 
 * Handles all job-related API endpoints
 */

import { Request, Response } from 'express';
import { JobService } from '../services/job.service';
import { Logger, PerformanceMonitor } from '@shared/utils';
import { CreateJobRequest, JobStatus, JobPriority } from '@shared/types';
import { MetricsService } from '../services/metrics.service';

export class JobController {
  private jobService = JobService.getInstance();
  private metricsService = MetricsService.getInstance();
  private logger = new Logger('JobController');

  /**
   * POST /jobs - Create a new job
   */
  async createJob(req: Request, res: Response): Promise<void> {
    const monitor = new PerformanceMonitor();
    monitor.start();

    try {
      const createRequest: CreateJobRequest = {
        type: req.body.type,
        payload: req.body.payload,
        priority: req.body.priority as JobPriority,
        delay: req.body.delay,
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
        cron: req.body.cron,
        idempotencyKey: req.body.idempotencyKey,
        metadata: req.body.metadata
      };

      // Validation
      if (!createRequest.type) {
        res.status(400).json({ success: false, error: 'Job type is required' });
        return;
      }

      if (!createRequest.payload) {
        res.status(400).json({ success: false, error: 'Job payload is required' });
        return;
      }

      const job = await this.jobService.createJob(createRequest);
      this.metricsService.recordJobCreated();

      const elapsed = monitor.end('Create Job');
      this.metricsService.recordRequest(elapsed);

      res.status(201).json({
        success: true,
        data: job,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });

    } catch (error) {
      this.logger.error('Failed to create job', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });
    }
  }

  /**
   * GET /jobs/:id - Get job details
   */
  async getJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const job = await this.jobService.getJob(id);

      if (!job) {
        res.status(404).json({ success: false, error: 'Job not found' });
        return;
      }

      res.json({
        success: true,
        data: job,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });

    } catch (error) {
      this.logger.error('Failed to get job', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });
    }
  }

  /**
   * GET /jobs - List jobs with filtering
   */
  async listJobs(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as JobStatus | undefined;
      const type = req.query.type as string | undefined;
      const priority = req.query.priority as JobPriority | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const { jobs, total } = await this.jobService.getJobs(
        status,
        type,
        priority,
        Math.min(limit, 100),
        offset
      );

      res.json({
        success: true,
        data: {
          jobs,
          pagination: {
            total,
            limit,
            offset,
            page: Math.floor(offset / limit) + 1,
            pages: Math.ceil(total / limit)
          }
        },
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });

    } catch (error) {
      this.logger.error('Failed to list jobs', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });
    }
  }

  /**
   * POST /jobs/:id/cancel - Cancel a job
   */
  async cancelJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.jobService.cancelJob(id);

      res.json({
        success: true,
        data: { message: 'Job cancelled successfully' },
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });

    } catch (error) {
      this.logger.error('Failed to cancel job', error);
      const statusCode = (error as Error).message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });
    }
  }

  /**
   * POST /jobs/:id/retry - Retry a failed job
   */
  async retryJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const job = await this.jobService.retryJob(id);

      res.json({
        success: true,
        data: job,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });

    } catch (error) {
      this.logger.error('Failed to retry job', error);
      const statusCode = (error as Error).message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });
    }
  }

  /**
   * GET /jobs/:id/logs - Get job event logs
   */
  async getJobLogs(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const logs = await this.jobService.getJobLogs(id);

      res.json({
        success: true,
        data: logs,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });

    } catch (error) {
      this.logger.error('Failed to get job logs', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      });
    }
  }
}
