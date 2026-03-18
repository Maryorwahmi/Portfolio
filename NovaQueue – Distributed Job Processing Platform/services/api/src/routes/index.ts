/**
 * Routes Setup
 * Author: CaptainCode
 * 
 * All API routes are configured here
 */

import { Express } from 'express';
import { JobController } from '../controllers/job.controller';
import { QueueController } from '../controllers/queue.controller';

const jobController = new JobController();
const queueController = new QueueController();

export function setupRoutes(app: Express): void {
  // ============================================
  // JOB ENDPOINTS
  // ============================================

  // Create job
  app.post('/jobs', (req, res) => jobController.createJob(req, res));

  // Get all jobs
  app.get('/jobs', (req, res) => jobController.listJobs(req, res));

  // Get single job
  app.get('/jobs/:id', (req, res) => jobController.getJob(req, res));

  // Cancel job
  app.post('/jobs/:id/cancel', (req, res) => jobController.cancelJob(req, res));

  // Retry job
  app.post('/jobs/:id/retry', (req, res) => jobController.retryJob(req, res));

  // Get job logs
  app.get('/jobs/:id/logs', (req, res) => jobController.getJobLogs(req, res));

  // ============================================
  // QUEUE ENDPOINTS
  // ============================================

  // Get all queues
  app.get('/queues', (req, res) => queueController.getQueueStats(req, res));

  // Get specific queue
  app.get('/queues/:name', (req, res) => queueController.getQueueDetail(req, res));

  // Get DLQ
  app.get('/dlq', (req, res) => queueController.getDeadLetterQueue(req, res));

  // ============================================
  // API DOCUMENTATION
  // ============================================

  app.get('/api/docs', (req, res) => {
    res.json(getApiDocumentation());
  });
}

function getApiDocumentation() {
  return {
    service: 'NovaQueue API',
    version: '2.0.0',
    author: 'CaptainCode',
    baseUrl: 'http://localhost:3000',
    endpoints: {
      jobs: {
        'POST /jobs': {
          description: 'Create a new job',
          example: {
            type: 'send_email',
            payload: { to: 'user@example.com', subject: 'Welcome' },
            priority: 'high',
            delay: 0
          }
        },
        'GET /jobs': 'List all jobs with optional filtering',
        'GET /jobs/:id': 'Get job details',
        'POST /jobs/:id/cancel': 'Cancel a job',
        'POST /jobs/:id/retry': 'Retry a failed job',
        'GET /jobs/:id/logs': 'Get job event logs'
      },
      queues: {
        'GET /queues': 'Get all queue statistics',
        'GET /queues/:name': 'Get specific queue details',
        'GET /dlq': 'Get Dead Letter Queue items'
      }
    }
  };
}
