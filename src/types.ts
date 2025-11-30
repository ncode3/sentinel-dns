/**
 * Type definitions for the DNS Sentinel application.
 * @module types
 */

/** Supported region identifiers for DNS probes */
export type RegionId = 'us-central1' | 'europe-west1' | 'asia-east1';

/** Health status of a region */
export type RegionStatus = 'HEALTHY' | 'DEGRADED' | 'TIMEOUT';

/**
 * Represents a geographic region where DNS probes are deployed.
 */
export interface Region {
  /** Unique identifier for the region */
  id: RegionId;
  /** Human-readable name of the region */
  name: string;
  /** Current latency in milliseconds */
  latency: number;
  /** Current health status */
  status: RegionStatus;
}

/**
 * Data collected from a single probe cycle across all regions.
 */
export interface ProbeData {
  /** ISO timestamp of when the probe was executed */
  timestamp: string;
  /** Array of region data from this probe cycle */
  regions: Region[];
}

/**
 * Represents a single log entry in the system.
 */
export interface SystemLog {
  /** Unique identifier for the log entry */
  id: string;
  /** When the log was created */
  timestamp: Date;
  /** Which component generated the log */
  source: 'WATCHER' | 'BRAIN' | 'HAMMER' | 'SYSTEM';
  /** The log message content */
  message: string;
  /** Severity level of the log */
  type: 'info' | 'warning' | 'error' | 'success';
}

/** 
 * Current operational state of the Sentinel agent.
 * - IDLE: Agent is not running
 * - MONITORING: Agent is actively monitoring
 * - ANALYZING: AI is processing telemetry
 * - REMEDIATING: Taking corrective action
 * - RECOVERED: Successfully recovered from an incident
 */
export type SentinelState = 'IDLE' | 'MONITORING' | 'ANALYZING' | 'REMEDIATING' | 'RECOVERED';

/**
 * Result from Gemini AI analysis of system health.
 */
export interface GeminiAnalysisResult {
  /** Overall health status determined by AI */
  status: 'HEALTHY' | 'CRITICAL' | 'WARNING';
  /** Human-readable explanation of the analysis */
  reasoning: string;
  /** Recommended action to take */
  recommendedAction: 'NONE' | 'FAILOVER' | 'SCALE_UP';
}
