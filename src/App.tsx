import React from 'react';
import { Activity, Shield, Server, Globe, Zap, Terminal, Play, Square } from 'lucide-react';
import { DashboardLayout } from './components/DashboardLayout';
import { NetworkMap } from './components/NetworkMap';
import { LatencyChart } from './components/LatencyChart';
import { EventLog } from './components/EventLog';
import { SystemStatus } from './components/SystemStatus';
import { GeminiAnalysis } from './components/GeminiAnalysis';
import { useSimulation } from './hooks/useSimulation';
import { MOCK_REGIONS } from './constants';

/**
 * Main application component for the DNS Sentinel dashboard.
 * Orchestrates the UI and delegates simulation logic to the useSimulation hook.
 */
const App: React.FC = () => {
  const {
    isActive,
    isChaosMode,
    primaryRouteHealthy,
    sentinelState,
    logs,
    probeHistory,
    lastAnalysis,
    toggleSimulation,
    toggleChaos,
  } = useSimulation();

  return (
    <DashboardLayout>
      {/* Header / Control Plane */}
      <header className="col-span-12 flex items-center justify-between bg-ops-panel border-b border-slate-700 p-4 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isActive ? 'bg-ops-accent/20 text-ops-accent' : 'bg-slate-700 text-slate-400'}`}>
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">DNS SENTINEL <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300 ml-2">v1.0.4</span></h1>
            <p className="text-xs text-slate-400 font-mono">Autonomous Infrastructure Defense Agent</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded border border-slate-700">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
            <span className="text-xs font-mono text-slate-300">{sentinelState}</span>
          </div>

          <button
            onClick={toggleChaos}
            disabled={!isActive}
            className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm transition-all ${
              isChaosMode 
                ? 'bg-ops-danger text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <Zap className="w-4 h-4" />
            {isChaosMode ? 'STOP CHAOS' : 'INJECT FAILURE'}
          </button>

          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm transition-all ${
              isActive 
                ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
                : 'bg-ops-accent text-ops-dark hover:bg-sky-400'
            }`}
          >
            {isActive ? <><Square className="w-4 h-4 fill-current" /> STOP AGENT</> : <><Play className="w-4 h-4 fill-current" /> START AGENT</>}
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="col-span-12 grid grid-cols-12 gap-6 p-6 min-h-[calc(100vh-80px)]">
        
        {/* Left Column: Visuals */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 gap-6 content-start">
          
          {/* Top Row: Map & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[350px]">
            <div className="md:col-span-2 bg-ops-panel rounded-lg border border-slate-700 overflow-hidden relative flex flex-col">
              <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-slate-400 uppercase">Global Telemetry (The Watcher)</span>
              </div>
              <div className="flex-1 w-full h-full">
                <NetworkMap regions={probeHistory.length > 0 ? probeHistory[probeHistory.length - 1].regions : MOCK_REGIONS} isChaos={isChaosMode} />
              </div>
            </div>
            
            <div className="bg-ops-panel rounded-lg border border-slate-700 p-4 flex flex-col gap-4">
              <h3 className="text-xs font-mono text-slate-400 uppercase flex items-center gap-2">
                <Server className="w-4 h-4" /> Route Status
              </h3>
              <SystemStatus isPrimary={primaryRouteHealthy} state={sentinelState} />
            </div>
          </div>

          {/* Latency Charts */}
          <div className="bg-ops-panel rounded-lg border border-slate-700 p-4 h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-mono text-slate-400 uppercase flex items-center gap-2">
                <Activity className="w-4 h-4" /> Real-time Latency (ms)
              </h3>
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-indigo-400">● US-Central</span>
                <span className="text-emerald-400">● EU-West</span>
                <span className="text-amber-400">● Asia-East</span>
              </div>
            </div>
            <div className="flex-1">
              <LatencyChart data={probeHistory} />
            </div>
          </div>

        </div>

        {/* Right Column: Intelligence & Logs */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">
          
          {/* The Brain: Gemini Analysis */}
          <div className="bg-slate-900/50 rounded-lg border border-slate-700 flex flex-col h-1/3 overflow-hidden">
             <div className="bg-slate-800/50 p-3 border-b border-slate-700 flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <Zap className="w-4 h-4 text-purple-400" />
                 <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">The Brain (Vertex AI)</span>
               </div>
               <span className="text-[10px] font-mono text-slate-500">gemini-2.5-flash</span>
             </div>
             <div className="flex-1 p-4 overflow-y-auto">
                <GeminiAnalysis analysis={lastAnalysis} state={sentinelState} />
             </div>
          </div>

          {/* The Hammer: Event Logs */}
          <div className="bg-black rounded-lg border border-slate-800 flex flex-col flex-1 overflow-hidden font-mono text-sm shadow-inner">
            <div className="bg-slate-900 p-2 border-b border-slate-800 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500">System & Remediation Logs</span>
            </div>
            <EventLog logs={logs} />
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default App;
