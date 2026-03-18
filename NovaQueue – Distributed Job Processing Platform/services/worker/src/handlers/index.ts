/**
 * Built-in Job Handlers
 * Author: CaptainCode
 * 
 * Example handlers for common job types
 */

import { Job, JobResult, JobHandler } from '@shared/types';
import { Logger } from '@shared/utils';
import { WorkerProcess } from './worker';

/**
 * Email handler - simulates sending emails
 */
class EmailJobHandler implements JobHandler {
  private logger = new Logger('EmailHandler');

  async handle(job: Job): Promise<JobResult> {
    const { to, subject, body } = job.payload;

    this.logger.debug(`Sending email to: ${to}`);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      data: {
        messageId: `msg_${Date.now()}`,
        to,
        subject,
        sentAt: new Date().toISOString()
      },
      timestamp: new Date()
    };
  }

  canHandle(jobType: string): boolean {
    return jobType === 'send_email';
  }
}

/**
 * Report generation handler
 */
class ReportJobHandler implements JobHandler {
  private logger = new Logger('ReportHandler');

  async handle(job: Job): Promise<JobResult> {
    const { type, period } = job.payload;

    this.logger.debug(`Generating ${type} report for period: ${period}`);

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      data: {
        reportId: `report_${Date.now()}`,
        type,
        period,
        rows: Math.floor(Math.random() * 1000),
        generatedAt: new Date().toISOString()
      },
      timestamp: new Date()
    };
  }

  canHandle(jobType: string): boolean {
    return jobType === 'generate_report';
  }
}

/**
 * Webhook notification handler
 */
class WebhookJobHandler implements JobHandler {
  private logger = new Logger('WebhookHandler');

  async handle(job: Job): Promise<JobResult> {
    const { url, data, retryCount = 0 } = job.payload;

    this.logger.debug(`Calling webhook: ${url}`);

    try {
      // Simulate webhook call
      const response = await Promise.race([
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )
      ]);

      if (!response || !response.ok) {
        throw new Error(`HTTP ${response?.status || 'error'}`);
      }

      return {
        success: true,
        data: {
          status: 'delivered',
          statusCode: response.status,
          url,
          deliveredAt: new Date().toISOString()
        },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Webhook failed: ${(error as Error).message}`);
    }
  }

  canHandle(jobType: string): boolean {
    return jobType === 'webhook_notification';
  }
}

/**
 * Register all default handlers
 */
export function registerJobHandlers(worker: WorkerProcess): void {
  worker.registerHandler('send_email', new EmailJobHandler());
  worker.registerHandler('generate_report', new ReportJobHandler());
  worker.registerHandler('webhook_notification', new WebhookJobHandler());
}
