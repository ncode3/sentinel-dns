import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSimulation } from '../useSimulation';

// Mock the geminiService
vi.mock('../../services/geminiService', () => ({
  analyzeSystemHealth: vi.fn().mockResolvedValue({
    status: 'HEALTHY',
    reasoning: 'All systems nominal',
    recommendedAction: 'NONE',
  }),
}));

describe('useSimulation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSimulation());

    expect(result.current.isActive).toBe(false);
    expect(result.current.isChaosMode).toBe(false);
    expect(result.current.primaryRouteHealthy).toBe(true);
    expect(result.current.sentinelState).toBe('IDLE');
    expect(result.current.probeHistory).toHaveLength(0);
    expect(result.current.lastAnalysis).toBeNull();
  });

  it('should have initial logs', () => {
    const { result } = renderHook(() => useSimulation());

    expect(result.current.logs.length).toBeGreaterThan(0);
    expect(result.current.logs.some(log => log.source === 'SYSTEM')).toBe(true);
  });

  it('should toggle simulation state', () => {
    const { result } = renderHook(() => useSimulation());

    expect(result.current.isActive).toBe(false);
    expect(result.current.sentinelState).toBe('IDLE');

    act(() => {
      result.current.toggleSimulation();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.sentinelState).toBe('MONITORING');

    act(() => {
      result.current.toggleSimulation();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.sentinelState).toBe('IDLE');
  });

  it('should toggle chaos mode when simulation is active', () => {
    const { result } = renderHook(() => useSimulation());

    // First activate the simulation
    act(() => {
      result.current.toggleSimulation();
    });

    expect(result.current.isChaosMode).toBe(false);

    act(() => {
      result.current.toggleChaos();
    });

    expect(result.current.isChaosMode).toBe(true);

    act(() => {
      result.current.toggleChaos();
    });

    expect(result.current.isChaosMode).toBe(false);
  });

  it('should add logs correctly', () => {
    const { result } = renderHook(() => useSimulation());

    const initialLogCount = result.current.logs.length;

    act(() => {
      result.current.addLog('SYSTEM', 'Test log message', 'info');
    });

    expect(result.current.logs.length).toBe(initialLogCount + 1);
    expect(result.current.logs[0].message).toBe('Test log message');
    expect(result.current.logs[0].source).toBe('SYSTEM');
    expect(result.current.logs[0].type).toBe('info');
  });

  it('should add activation log when simulation starts', () => {
    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.toggleSimulation();
    });

    const activationLog = result.current.logs.find(
      log => log.message.includes('Sentinel activated')
    );
    expect(activationLog).toBeDefined();
    expect(activationLog?.type).toBe('success');
  });

  it('should add deactivation log when simulation stops', () => {
    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.toggleSimulation(); // Start
    });

    act(() => {
      result.current.toggleSimulation(); // Stop
    });

    const deactivationLog = result.current.logs.find(
      log => log.message.includes('Sentinel deactivated')
    );
    expect(deactivationLog).toBeDefined();
  });
});
