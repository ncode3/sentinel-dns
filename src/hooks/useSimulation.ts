import { useState, useEffect, useCallback, useRef } from 'react';
import { analyzeSystemHealth } from '../services/geminiService';
import { ProbeData, SystemLog, SentinelState, RegionStatus } from '../types';
import { INITIAL_LOGS, MOCK_REGIONS } from '../constants';

/**
 * Return type for the useSimulation hook
 */
export interface UseSimulationReturn {
  /** Whether the simulation is currently running */
  isActive: boolean;
  /** Whether chaos/failure mode is enabled */
  isChaosMode: boolean;
  /** Whether the primary route is healthy */
  primaryRouteHealthy: boolean;
  /** Current state of the sentinel agent */
  sentinelState: SentinelState;
  /** Array of system logs */
  logs: SystemLog[];
  /** History of probe data for charting */
  probeHistory: ProbeData[];
  /** Last analysis result from Gemini */
  lastAnalysis: string | null;
  /** Toggle the simulation on/off */
  toggleSimulation: () => void;
  /** Toggle chaos/failure mode */
  toggleChaos: () => void;
  /** Add a log entry */
  addLog: (source: SystemLog['source'], message: string, type?: SystemLog['type']) => void;
}

/**
 * Custom hook that encapsulates all simulation logic for the DNS Sentinel.
 * 
 * This hook manages:
 * - Simulation state (active, chaos mode, route health)
 * - Probe data generation and history
 * - AI analysis via Gemini
 * - Automatic failover logic
 * - System logging
 * 
 * @example
 * ```tsx
 * const { isActive, toggleSimulation, probeHistory, logs } = useSimulation();
 * ```
 * 
 * @returns {UseSimulationReturn} Object containing all simulation state and controls
 */
export const useSimulation = (): UseSimulationReturn => {
  // System State
  const [isActive, setIsActive] = useState(false);
  const [isChaosMode, setIsChaosMode] = useState(false);
  const [primaryRouteHealthy, setPrimaryRouteHealthy] = useState(true);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [probeHistory, setProbeHistory] = useState<ProbeData[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);
  const [sentinelState, setSentinelState] = useState<SentinelState>('IDLE');
  
  // Refs for simulation loop to avoid stale closures
  const intervalRef = useRef<number | null>(null);
  const chaosRef = useRef(isChaosMode);
  const primaryRouteRef = useRef(primaryRouteHealthy);

  // Keep refs in sync with state
  useEffect(() => { chaosRef.current = isChaosMode; }, [isChaosMode]);
  useEffect(() => { primaryRouteRef.current = primaryRouteHealthy; }, [primaryRouteHealthy]);

  /**
   * Adds a new log entry to the system logs.
   * Automatically truncates to the most recent 50 entries.
   * 
   * @param source - The component generating the log (WATCHER, BRAIN, HAMMER, SYSTEM)
   * @param message - The log message
   * @param type - Log severity level (info, warning, error, success)
   */
  const addLog = useCallback((
    source: SystemLog['source'], 
    message: string, 
    type: SystemLog['type'] = 'info'
  ) => {
    const newLog: SystemLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
      source,
      message,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  /**
   * Triggers a DNS failover to the backup route.
   * Called by the Brain when a critical failure is detected.
   */
  const triggerFailover = useCallback(() => {
    setPrimaryRouteHealthy(false);
    addLog('HAMMER', 'Cloud DNS Record Updated: @ 192.0.2.1 -> 203.0.113.5 (Backup Provider)', 'success');
    addLog('HAMMER', 'TTL Flushed. Propagation started.', 'info');
    setSentinelState('RECOVERED');
  }, [addLog]);

  /**
   * Runs a single simulation tick.
   * This is the core of the Sense-Think-Act loop:
   * 1. WATCHER: Generate probe data from all regions
   * 2. BRAIN: Analyze with Gemini AI
   * 3. HAMMER: Execute remediation if needed
   */
  const runSimulationTick = useCallback(async () => {
    const timestamp = new Date().toISOString();
    const isChaos = chaosRef.current;
    
    // 1. THE WATCHER: Generate Probe Data
    const newProbeData: ProbeData = {
      timestamp,
      regions: MOCK_REGIONS.map(r => {
        let latency = Math.floor(Math.random() * 40) + 20; // Base 20-60ms
        let status: RegionStatus = 'HEALTHY';

        if (isChaos) {
          // Simulate partial or total failure
          if (r.id === 'us-central1' || r.id === 'europe-west1') {
            latency = Math.floor(Math.random() * 2000) + 500; // High latency
            if (Math.random() > 0.7) status = 'TIMEOUT';
            else status = 'DEGRADED';
          }
        } else if (!primaryRouteRef.current) {
          // We are on backup route (simulated)
          latency += 10; // Backup route slightly slower
        }

        return { ...r, latency, status };
      })
    };

    setProbeHistory(prev => [...prev.slice(-19), newProbeData]);

    // 2. THE BRAIN: Analyze with Gemini
    const shouldAnalyze = isChaos || !primaryRouteRef.current; 
    
    if (shouldAnalyze) {
      setSentinelState('ANALYZING');
      try {
        const analysisResult = await analyzeSystemHealth(newProbeData.regions);
        setLastAnalysis(analysisResult.reasoning);

        if (analysisResult.status === 'CRITICAL' && primaryRouteRef.current) {
          addLog('BRAIN', `Gemini detected anomaly: ${analysisResult.reasoning}`, 'error');
          setSentinelState('REMEDIATING');
          
          // 3. THE HAMMER: trigger failover
          setTimeout(() => {
            addLog('HAMMER', 'Initiating Route Failover Protocol...', 'warning');
            triggerFailover();
          }, 1500);
        } else if (analysisResult.status === 'HEALTHY' && !primaryRouteRef.current && !isChaos) {
          // Auto-healing check
          addLog('BRAIN', 'Metrics stabilized. Suggesting return to primary.', 'success');
          setSentinelState('MONITORING');
        } else {
          setSentinelState('MONITORING');
        }

      } catch (error) {
        console.error("Gemini API Error", error);
        addLog('BRAIN', 'AI Analysis failed: connection error', 'error');
      }
    } else {
      setSentinelState('MONITORING');
    }

  }, [addLog, triggerFailover]);

  /**
   * Toggles the simulation on or off.
   * When starting, begins the monitoring loop.
   * When stopping, clears all intervals and resets state.
   */
  const toggleSimulation = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      setSentinelState('IDLE');
      addLog('SYSTEM', 'Sentinel deactivated.', 'info');
    } else {
      setIsActive(true);
      setSentinelState('MONITORING');
      addLog('SYSTEM', 'Sentinel activated. Monitoring global latency.', 'success');
    }
  }, [isActive, addLog]);

  /**
   * Toggles chaos/failure mode.
   * When enabled, simulates a DNS provider outage.
   * When disabled, begins the recovery process.
   */
  const toggleChaos = useCallback(() => {
    const newState = !isChaosMode;
    setIsChaosMode(newState);
    if (newState) {
      addLog('SYSTEM', 'CHAOS INJECTED: Simulating Primary DNS Failure', 'error');
    } else {
      addLog('SYSTEM', 'Chaos stopped. Systems stabilizing.', 'info');
      // Reset route health after chaos stops for demo purposes
      setTimeout(() => {
        setPrimaryRouteHealthy(true);
        addLog('HAMMER', 'Primary route confirmed stable. Reverting DNS.', 'success');
      }, 3000);
    }
  }, [isChaosMode, addLog]);

  // Simulation loop effect
  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(runSimulationTick, 2000);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isActive, runSimulationTick]);

  return {
    isActive,
    isChaosMode,
    primaryRouteHealthy,
    sentinelState,
    logs,
    probeHistory,
    lastAnalysis,
    toggleSimulation,
    toggleChaos,
    addLog,
  };
};

export default useSimulation;
