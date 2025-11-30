import { describe, it, expect, vi } from 'vitest';
import { analyzeSystemHealth } from '../geminiService';
import { Region } from '../../types';

// Mock the @google/genai module
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
  Type: {
    OBJECT: 'object',
    STRING: 'string',
  },
  Schema: vi.fn(),
}));

describe('geminiService', () => {
  describe('analyzeSystemHealth', () => {
    it('should return HEALTHY status when all regions are healthy', async () => {
      const healthyRegions: Region[] = [
        { id: 'us-central1', name: 'US Central', latency: 30, status: 'HEALTHY' },
        { id: 'europe-west1', name: 'EU West', latency: 80, status: 'HEALTHY' },
        { id: 'asia-east1', name: 'Asia East', latency: 120, status: 'HEALTHY' },
      ];

      const result = await analyzeSystemHealth(healthyRegions);

      expect(result.status).toBe('HEALTHY');
      expect(result.recommendedAction).toBe('NONE');
    });

    it('should return CRITICAL status when regions have high latency', async () => {
      const unhealthyRegions: Region[] = [
        { id: 'us-central1', name: 'US Central', latency: 500, status: 'DEGRADED' },
        { id: 'europe-west1', name: 'EU West', latency: 800, status: 'TIMEOUT' },
        { id: 'asia-east1', name: 'Asia East', latency: 120, status: 'HEALTHY' },
      ];

      const result = await analyzeSystemHealth(unhealthyRegions);

      expect(result.status).toBe('CRITICAL');
      expect(result.recommendedAction).toBe('FAILOVER');
    });

    it('should return CRITICAL when any region has TIMEOUT status', async () => {
      const timeoutRegions: Region[] = [
        { id: 'us-central1', name: 'US Central', latency: 30, status: 'HEALTHY' },
        { id: 'europe-west1', name: 'EU West', latency: 0, status: 'TIMEOUT' },
        { id: 'asia-east1', name: 'Asia East', latency: 120, status: 'HEALTHY' },
      ];

      const result = await analyzeSystemHealth(timeoutRegions);

      expect(result.status).toBe('CRITICAL');
      expect(result.recommendedAction).toBe('FAILOVER');
    });

    it('should include reasoning in the response', async () => {
      const regions: Region[] = [
        { id: 'us-central1', name: 'US Central', latency: 30, status: 'HEALTHY' },
        { id: 'europe-west1', name: 'EU West', latency: 80, status: 'HEALTHY' },
        { id: 'asia-east1', name: 'Asia East', latency: 120, status: 'HEALTHY' },
      ];

      const result = await analyzeSystemHealth(regions);

      expect(result.reasoning).toBeDefined();
      expect(typeof result.reasoning).toBe('string');
      expect(result.reasoning.length).toBeGreaterThan(0);
    });
  });
});
