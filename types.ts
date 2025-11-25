
export type RegionId = 'us-central1' | 'europe-west1' | 'asia-east1';
export type RegionStatus = 'HEALTHY' | 'DEGRADED' | 'TIMEOUT';

export interface Region {
  id: RegionId;
  name: string;
  latency: number;
  status: RegionStatus;
}

export interface ProbeData {
  timestamp: string;
  regions: Region[];
}

export interface SystemLog {
  id: string;
  timestamp: Date;
  source: 'WATCHER' | 'BRAIN' | 'HAMMER' | 'SYSTEM';
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export type SentinelState = 'IDLE' | 'MONITORING' | 'ANALYZING' | 'REMEDIATING' | 'RECOVERED';

export interface GeminiAnalysisResult {
  status: 'HEALTHY' | 'CRITICAL' | 'WARNING';
  reasoning: string;
  recommendedAction: 'NONE' | 'FAILOVER' | 'SCALE_UP';
}
