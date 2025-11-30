import React from 'react';
import { SentinelState } from '../types';

/**
 * Props for the SystemStatus component.
 */
export interface SystemStatusProps {
  /** Whether the primary DNS route is healthy */
  isPrimary: boolean;
  /** Current operational state of the sentinel */
  state: SentinelState;
}

/**
 * Displays the current system status including active DNS route
 * and operational state of the sentinel agent.
 * 
 * @param props - Component props
 * @param props.isPrimary - Whether using primary or backup route
 * @param props.state - Current sentinel state
 */
export const SystemStatus: React.FC<SystemStatusProps> = ({ isPrimary, state }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded border border-slate-700">
        <span className="text-sm text-slate-400">Active DNS Route</span>
        <span className={`px-2 py-1 rounded text-xs font-bold ${isPrimary ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-amber-500/20 text-amber-400 border border-amber-500/50'}`}>
          {isPrimary ? 'PRIMARY (GCP Cloud Run)' : 'SECONDARY (AWS Failover)'}
        </span>
      </div>

      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded border border-slate-700">
        <span className="text-sm text-slate-400">Operational Status</span>
        <span className={`px-2 py-1 rounded text-xs font-bold ${state === 'REMEDIATING' ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'}`}>
          {state}
        </span>
      </div>

      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded border border-slate-700">
         <span className="text-sm text-slate-400">Last DNS Update</span>
         <span className="text-xs font-mono text-slate-300">
            {isPrimary ? '24h ago' : 'Just now'}
         </span>
      </div>
    </div>
  );
};
