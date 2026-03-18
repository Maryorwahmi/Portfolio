/**
 * Metrics Service
 * Author: CaptainCode
 * 
 * Tracks and collects system metrics for monitoring and analytics
 */

import { Logger } from '@shared/utils';

export class MetricsService {
  private static instance: MetricsService;
  private logger = new Logger('MetricsService');
  
  private metrics = {
    totalRequests: 0,
    totalJobsCreated: 0,
    totalJobsCompleted: 0,
    totalJobsFailed: 0,
    totalJobsRetried: 0,
    averageResponseTime: 0,
    responseTimes: [] as number[]
  };

  private constructor() {}

  static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  start(): void {
    this.logger.info('Metrics service started');
  }

  recordRequest(responseTimeMs: number): void {
    this.metrics.totalRequests++;
    this.metrics.responseTimes.push(responseTimeMs);
    
    // Keep only last 1000 response times for memory efficiency
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }

    this.metrics.averageResponseTime = 
      this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length;
  }

  recordJobCreated(): void {
    this.metrics.totalJobsCreated++;
  }

  recordJobCompleted(): void {
    this.metrics.totalJobsCompleted++;
  }

  recordJobFailed(): void {
    this.metrics.totalJobsFailed++;
  }

  recordJobRetried(): void {
    this.metrics.totalJobsRetried++;
  }

  getMetrics(): any {
    return {
      ...this.metrics,
      successRate: this.metrics.totalJobsCompleted / (this.metrics.totalJobsCompleted + this.metrics.totalJobsFailed) || 0,
      timestamp: new Date().toISOString()
    };
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      totalJobsCreated: 0,
      totalJobsCompleted: 0,
      totalJobsFailed: 0,
      totalJobsRetried: 0,
      averageResponseTime: 0,
      responseTimes: []
    };
  }
}
