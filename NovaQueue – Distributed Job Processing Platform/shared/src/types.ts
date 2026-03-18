/**
 * NovaQueue Shared Types
 * Author: CaptainCode
 * Company: NovaCore Systems
 * 
 * Core type definitions for the entire NovaQueue platform
 */

// ============================================
// JOB TYPE DEFINITIONS
// ============================================

export enum JobPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
  CANCELLED = 'cancelled',
  DELAYED = 'delayed'
}

export enum JobQueueType {
  DEFAULT = 'default',
  HIGH_PRIORITY = 'high_priority',
  LOW_PRIORITY = 'low_priority',
  CRITICAL = 'critical'
}

export interface JobPayload {
  [key: string]: any;
}

export interface JobMetadata {
  createdBy?: string;
  source?: string;
  tags?: string[];
  idempotencyKey?: string;
}

export interface Job {
  id: string;
  type: string;
  payload: JobPayload;
  priority: JobPriority;
  status: JobStatus;
  queue: JobQueueType;
  retries: number;
  maxRetries: number;
  delay?: number;
  scheduledAt?: Date;
  cron?: string;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  lastError?: string;
  metadata?: JobMetadata;
  createdAt: Date;
  updatedAt: Date;
  workerInstanceId?: string;
  executionTimeMs?: number;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

// ============================================
// WORKER DEFINITIONS
// ============================================

export enum WorkerStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  PAUSED = 'paused',
  OFFLINE = 'offline'
}

export interface Worker {
  id: string;
  name: string;
  status: WorkerStatus;
  handledTypes: string[];
  activeJobCount: number;
  totalJobsProcessed: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  lastHeartbeat: Date;
  version: string;
  uptime: number;
}

export interface WorkerHeartbeat {
  workerId: string;
  status: WorkerStatus;
  activeJobCount: number;
  totalJobsProcessed: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  timestamp: Date;
}

// ============================================
// QUEUE STATISTICS
// ============================================

export interface QueueStats {
  name: string;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  dlq: number;
  totalJobs: number;
  throughput: number; // jobs per second
  averageProcessingTime: number;
  lastUpdated: Date;
}

export interface SystemMetrics {
  uptime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpuUsage: number;
  totalJobs: number;
  activeJobs: number;
  failedJobs: number;
  successRate: number;
  workerCount: number;
  queueStats: QueueStats[];
  timestamp: Date;
}

// ============================================
// API REQUEST/RESPONSE
// ============================================

export interface CreateJobRequest {
  type: string;
  payload: JobPayload;
  priority?: JobPriority;
  delay?: number;
  scheduledAt?: Date;
  cron?: string;
  idempotencyKey?: string;
  metadata?: JobMetadata;
}

export interface JobQueryFilter {
  status?: JobStatus;
  type?: string;
  priority?: JobPriority;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ============================================
// REDIS MESSAGE TYPES
// ============================================

export interface JobMessage {
  jobId: string;
  type: string;
  payload: JobPayload;
  priority: JobPriority;
  retries: number;
  maxRetries: number;
  metadata?: JobMetadata;
  timestamp: number;
}

export interface JobEvent {
  jobId: string;
  event: 'created' | 'started' | 'completed' | 'failed' | 'retrying' | 'cancelled';
  status: JobStatus;
  workerId?: string;
  data?: any;
  timestamp: Date;
}

// ============================================
// HANDLER INTERFACE
// ============================================

export interface JobHandler {
  handle(job: Job): Promise<JobResult>;
  canHandle(jobType: string): boolean;
  onRetry?(job: Job, attempt: number): Promise<void>;
  onFailure?(job: Job, error: Error): Promise<void>;
}

// ============================================
// CONFIGURATION
// ============================================

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  logging?: boolean;
  ssl?: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
}

export interface WorkerConfig {
  concurrency: number;
  pollInterval: number;
  maxRetries: number;
  backoffMultiplier: number;
  initialBackoffMs: number;
}

export interface SchedulerConfig {
  interval: number;
  maxDelay: number;
  batchSize: number;
}

export interface AppConfig {
  env: 'development' | 'staging' | 'production';
  port: number;
  host: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  database: DatabaseConfig;
  redis: RedisConfig;
  worker?: WorkerConfig;
  scheduler?: SchedulerConfig;
}
