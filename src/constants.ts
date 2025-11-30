/**
 * Application constants for the DNS Sentinel.
 * @module constants
 */

import { Region, SystemLog } from "./types";

/**
 * Default region configuration for DNS probes.
 * These represent the geographic distribution of the monitoring fleet.
 */
export const MOCK_REGIONS: Region[] = [
  { id: 'us-central1', name: 'US Central (Iowa)', latency: 24, status: 'HEALTHY' },
  { id: 'europe-west1', name: 'Europe West (Belgium)', latency: 88, status: 'HEALTHY' },
  { id: 'asia-east1', name: 'Asia East (Taiwan)', latency: 145, status: 'HEALTHY' },
];

/**
 * Initial log entries displayed when the application starts.
 */
export const INITIAL_LOGS: SystemLog[] = [
  { id: '0', timestamp: new Date(), source: 'SYSTEM', message: 'Sentinel Core initialized.', type: 'info' },
  { id: '1', timestamp: new Date(), source: 'WATCHER', message: 'Probe configuration loaded: 3 Regions.', type: 'info' },
  { id: '2', timestamp: new Date(), source: 'BRAIN', message: 'Connected to Vertex AI (Gemini 1.5 Pro).', type: 'info' },
];

/**
 * Latency thresholds for determining region health (in milliseconds).
 */
export const LATENCY_THRESHOLDS = {
  US: 100,
  EU: 150,
  ASIA: 250,
  CRITICAL: 400,
} as const;

/**
 * Simulation configuration values.
 */
export const SIMULATION_CONFIG = {
  /** Interval between probe cycles in milliseconds */
  TICK_INTERVAL: 2000,
  /** Maximum number of probe history entries to keep */
  MAX_PROBE_HISTORY: 20,
  /** Maximum number of log entries to keep */
  MAX_LOG_ENTRIES: 50,
} as const;
