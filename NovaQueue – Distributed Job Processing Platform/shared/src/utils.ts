/**
 * NovaQueue Shared Utilities
 * Author: CaptainCode
 * Company: NovaCore Systems
 */

import { nanoid } from 'nanoid';

/**
 * Generate a unique job ID
 */
export function generateJobId(): string {
  return `job_${nanoid(16)}`;
}

/**
 * Generate a unique worker ID
 */
export function generateWorkerId(): string {
  return `worker_${nanoid(12)}`;
}

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${nanoid(16)}`;
}

/**
 * Calculate backoff delay (exponential)
 */
export function getBackoffDelay(
  attempt: number,
  initialDelayMs: number = 1000,
  multiplier: number = 3
): number {
  return initialDelayMs * Math.pow(multiplier, attempt - 1);
}

/**
 * Queue name based on priority
 */
export function getQueueNameByPriority(priority: string): string {
  const queueMap: Record<string, string> = {
    critical: 'critical',
    high: 'high_priority',
    medium: 'default',
    low: 'low_priority'
  };
  return queueMap[priority] || 'default';
}

/**
 * Parse cron expression (basic validation)
 */
export function isValidCron(cron: string): boolean {
  const parts = cron.trim().split(/\s+/);
  return parts.length === 5 || parts.length === 6;
}

/**
 * Get next run time from cron (uses simple calculation)
 */
export function getNextRunTimeMock(cron: string): Date {
  // In production, use a library like cron-parser
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return tomorrow;
}

/**
 * Retry-safe handler wrapper
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  backoffMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const delay = getBackoffDelay(attempt + 1, backoffMs);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Logger utility
 */
export class Logger {
  constructor(private context: string) {}

  debug(message: string, data?: any) {
    console.log(`[${this.context}] DEBUG: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  info(message: string, data?: any) {
    console.log(`[${this.context}] INFO: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  warn(message: string, data?: any) {
    console.warn(`[${this.context}] WARN: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  error(message: string, error?: any) {
    console.error(`[${this.context}] ERROR: ${message}`, error);
  }
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private startTime: number = 0;

  start() {
    this.startTime = Date.now();
  }

  end(label: string = 'Operation'): number {
    const elapsed = Date.now() - this.startTime;
    console.log(`${label} took ${elapsed}ms`);
    return elapsed;
  }

  static measure<T>(label: string, fn: () => T): { result: T; elapsed: number } {
    const start = Date.now();
    const result = fn();
    const elapsed = Date.now() - start;
    console.log(`${label} took ${elapsed}ms`);
    return { result, elapsed };
  }
}

/**
 * Idempotency helper
 */
export class IdempotencyManager {
  private cache = new Map<string, any>();

  set(key: string, value: any, ttlMs: number = 3600000) {
    this.cache.set(key, value);
    setTimeout(() => this.cache.delete(key), ttlMs);
  }

  get(key: string) {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

export default {
  generateJobId,
  generateWorkerId,
  generateRequestId,
  getBackoffDelay,
  getQueueNameByPriority,
  isValidCron,
  withRetry,
  Logger,
  PerformanceMonitor,
  IdempotencyManager
};
