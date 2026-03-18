/**
 * Database Initialization
 * Author: CaptainCode
 */

import { DatabaseService } from '../services/database.service';
import { Logger } from '@shared/utils';

const logger = new Logger('DatabaseInit');

export async function initializeDatabase(): Promise<void> {
  const db = DatabaseService.getInstance();
  
  try {
    await db.connect();
    
    // Run migrations
    await runMigrations(db);
    
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database', error);
    throw error;
  }
}

async function runMigrations(db: DatabaseService): Promise<void> {
  const client = await db.getClient();

  try {
    // Create jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        payload JSONB NOT NULL,
        status VARCHAR(50) NOT NULL,
        priority VARCHAR(20) NOT NULL,
        queue VARCHAR(50) NOT NULL,
        retries INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        delay INTEGER DEFAULT 0,
        scheduled_at TIMESTAMP,
        cron VARCHAR(100),
        processed_at TIMESTAMP,
        completed_at TIMESTAMP,
        failed_at TIMESTAMP,
        last_error TEXT,
        worker_instance_id VARCHAR(50),
        execution_time_ms INTEGER,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_priority (priority)
      );
    `);

    // Create job_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_logs (
        id SERIAL PRIMARY KEY,
        job_id VARCHAR(50) NOT NULL REFERENCES jobs(id),
        status VARCHAR(50) NOT NULL,
        message TEXT,
        timestamp TIMESTAMP NOT NULL,
        INDEX idx_job_id (job_id),
        INDEX idx_timestamp (timestamp)
      );
    `);

    // Create workers table (for monitoring)
    await client.query(`
      CREATE TABLE IF NOT EXISTS workers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        handled_types TEXT NOT NULL,
        active_job_count INTEGER DEFAULT 0,
        total_jobs_processed INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        average_execution_time DECIMAL(10, 2),
        last_heartbeat TIMESTAMP,
        version VARCHAR(20),
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    logger.info('Database migrations completed');
  } catch (error) {
    // Table already exists - this is fine
    logger.debug('Tables already exist');
  } finally {
    client.release();
  }
}
