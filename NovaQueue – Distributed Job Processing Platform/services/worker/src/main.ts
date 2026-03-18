/**
 * NovaQueue Worker Service
 * Author: CaptainCode | Company: NovaCore Systems
 * 
 * Processes background jobs from queues with reliability and scalability
 */

import { Logger, generateWorkerId, getBackoffDelay, withRetry } from '@shared/utils';
import { Job, JobStatus, JobResult, JobHandler } from '@shared/types';
import { WorkerProcess } from './worker';
import { registerJobHandlers } from './handlers';

require('dotenv').config();

const logger = new Logger('Worker-Bootstrap');

async function bootstrap() {
  try {
    logger.info('🚀 Starting NovaQueue Worker Service...');
    logger.info('👨‍💻 Created with ❤️ by CaptainCode');
    logger.info('🏢 Company: NovaCore Systems');

    // Initialize worker
    const workerId = generateWorkerId();
    const worker = new WorkerProcess(workerId);

    // Register job handlers
    registerJobHandlers(worker);

    // Start worker
    await worker.start();

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      await worker.stop();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start worker service', error);
    process.exit(1);
  }
}

bootstrap();
