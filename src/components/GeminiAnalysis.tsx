import React from 'react';
import { SentinelState } from '../types';
import { Sparkles, Loader } from 'lucide-react';

/**
 * Props for the GeminiAnalysis component.
 */
interface Props {
  /** The latest analysis text from Gemini */
  analysis: string | null;
  /** Current state of the sentinel agent */
  state: SentinelState;
}

/**
 * Displays AI analysis results from the Gemini model.
 * Shows a loading state while analyzing and the reasoning output.
 * 
 * @param props - Component props
 * @param props.analysis - The analysis text to display
 * @param props.state - Current sentinel state for loading indicator
 */
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
