/**
 * API Tests
 * Author: CaptainCode
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

describe('NovaQueue API', () => {
  describe('Job Management', () => {
    it('should create a job', async () => {
      const response = await axios.post(`${API_BASE_URL}/jobs`, {
        type: 'send_email',
        payload: {
          to: 'test@example.com',
          subject: 'Test',
          body: 'Test body'
        },
        priority: 'high'
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBeDefined();
    });

    it('should get job by id', async () => {
      const createRes = await axios.post(`${API_BASE_URL}/jobs`, {
        type: 'send_email',
        payload: { to: 'test@example.com' },
        priority: 'medium'
      });

      const jobId = createRes.data.data.id;
      const getRes = await axios.get(`${API_BASE_URL}/jobs/${jobId}`);

      expect(getRes.status).toBe(200);
      expect(getRes.data.data.id).toBe(jobId);
    });

    it('should list jobs', async () => {
      const response = await axios.get(`${API_BASE_URL}/jobs`);

      expect(response.status).toBe(200);
      expect(response.data.data.jobs).toBeDefined();
      expect(Array.isArray(response.data.data.jobs)).toBe(true);
    });

    it('should validate required fields', async () => {
      try {
        await axios.post(`${API_BASE_URL}/jobs`, {
          payload: { to: 'test@example.com' }
          // Missing 'type'
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Queue Management', () => {
    it('should get queue stats', async () => {
      const response = await axios.get(`${API_BASE_URL}/queues`);

      expect(response.status).toBe(200);
      expect(response.data.data.queues).toBeDefined();
      expect(response.data.data.system).toBeDefined();
    });

    it('should get DLQ', async () => {
      const response = await axios.get(`${API_BASE_URL}/dlq`);

      expect(response.status).toBe(200);
      expect(response.data.data.dlq).toBeDefined();
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await axios.get(`${API_BASE_URL}/health`);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('healthy');
    });
  });
});
