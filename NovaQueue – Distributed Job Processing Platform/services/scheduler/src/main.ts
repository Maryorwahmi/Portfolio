/**
 * NovaQueue Scheduler Service
 * Author: CaptainCode | Company: NovaCore Systems
 * 
 * Manages delayed jobs and cron scheduling
 */

import { Logger, generateRequestId } from '@shared/utils';
import { SchedulerService } from './scheduler';

require('dotenv').config();

const logger = new Logger('Scheduler-Bootstrap');

async function bootstrap() {
  try {
    logger.info('🚀 Starting NovaQueue Scheduler Service...');
    logger.info('👨‍💻 Created with ❤️ by CaptainCode');
    logger.info('🏢 Company: NovaCore Systems');

    const scheduler = new SchedulerService();

    // Start scheduler
    await scheduler.start();

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      await scheduler.stop();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start scheduler service', error);
    process.exit(1);
  }
}

bootstrap();
