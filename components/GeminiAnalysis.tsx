import React from 'react';
import { SentinelState } from '../types';
import { Sparkles, Loader } from 'lucide-react';

interface Props {
  analysis: string | null;
  state: SentinelState;
}

export const GeminiAnalysis: React.FC<Props> = ({ analysis, state }) => {
  if (!analysis && state !== 'ANALYZING') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-50">
        <Sparkles className="w-8 h-8" />
        <span className="text-xs font-mono">Waiting for telemetry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 font-mono text-sm">
      {state === 'ANALYZING' && (
        <div className="flex items-center gap-2 text-purple-300 animate-pulse mb-2">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Processing real-time telemetry patterns...</span>
        </div>
      )}
      
      {analysis && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <span className="text-purple-500 mr-2">{'>'}</span>
          <span className="text-slate-300 leading-relaxed typing-effect">
            {analysis}
          </span>
        </div>
      )}
    </div>
  );
};
