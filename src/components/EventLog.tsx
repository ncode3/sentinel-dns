import React, { useEffect, useRef } from 'react';
import { SystemLog } from '../types';

/**
 * Props for the EventLog component.
 */
interface Props {
  /** Array of log entries to display */
  logs: SystemLog[];
}

/**
 * Displays system and remediation logs in a terminal-style interface.
 * Auto-scrolls to show the latest entries.
 * 
 * @param props - Component props
 * @param props.logs - Array of system log entries
 */
export const EventLog: React.FC<Props> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const formatTime = (timestamp: Date) => {
    const d = new Date(timestamp);
    return `${d.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2">
      {logs.slice().reverse().map((log) => (
        <div key={log.id} className="flex gap-3 items-start animate-fade-in">
          <span className="text-slate-600 min-w-[70px]">
            {formatTime(log.timestamp)}
          </span>
          <span className={`font-bold min-w-[60px] ${
            log.source === 'WATCHER' ? 'text-blue-400' :
            log.source === 'BRAIN' ? 'text-purple-400' :
            log.source === 'HAMMER' ? 'text-orange-400' : 'text-slate-400'
          }`}>
            [{log.source}]
          </span>
          <span className={`${
            log.type === 'error' ? 'text-red-400' :
            log.type === 'success' ? 'text-green-400' :
            log.type === 'warning' ? 'text-amber-400' : 'text-slate-300'
          }`}>
            {log.message}
          </span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};
