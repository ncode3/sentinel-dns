import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Shield, ShieldAlert, Server, Globe, Zap, Terminal, Play, Square } from 'lucide-react';
import { DashboardLayout } from './components/DashboardLayout';
import { NetworkMap } from './components/NetworkMap';
import { LatencyChart } from './components/LatencyChart';
import { EventLog } from './components/EventLog';
import { SystemStatus } from './components/SystemStatus';
import { GeminiAnalysis } from './components/GeminiAnalysis';
import { analyzeSystemHealth } from './services/geminiService';
import { ProbeData, SystemLog, SentinelState, Region, RegionStatus } from './types';
import { INITIAL_LOGS, MOCK_REGIONS } from './constants';

const App: React.FC = () => {
  // System State
  const [isActive, setIsActive] = useState(false);
  const [isChaosMode, setIsChaosMode] = useState(false);
  const [primaryRouteHealthy, setPrimaryRouteHealthy] = useState(true);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [probeHistory, setProbeHistory] = useState<ProbeData[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);
  const [sentinelState, setSentinelState] = useState<SentinelState>('IDLE');
  
  // Refs for simulation loop
  const intervalRef = useRef<number | null>(null);
  const chaosRef = useRef(isChaosMode);
  const primaryRouteRef = useRef(primaryRouteHealthy);

  // Sync refs
  useEffect(() => { chaosRef.current = isChaosMode; }, [isChaosMode]);
  useEffect(() => { primaryRouteRef.current = primaryRouteHealthy; }, [primaryRouteHealthy]);

  const addLog = (source: SystemLog['source'], message: string, type: SystemLog['type'] = 'info') => {
    const newLog: SystemLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
      source,
      message,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // Simulation Engine
  const runSimulationTick = useCallback(async () => {
    const timestamp = new Date().toISOString();
    const isChaos = chaosRef.current;
    const isHealed = !primaryRouteRef.current && !isChaos; // If chaos is off but route is marked unhealthy (healing phase)
    
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
    // We throttle AI calls to avoid rate limits in this demo loop, calling every 3rd tick or if chaos just started
    const shouldAnalyze = isChaos || !primaryRouteRef.current; 
    
    if (shouldAnalyze) {
      setSentinelState('ANALYZING');
      try {
        // In a real app, we'd send the JSON data. Here we simulate the payload structure.
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

  }, []);

  // failover logic
  const triggerFailover = () => {
    setPrimaryRouteHealthy(false); // Switch to "Backup" logic in simulation
    addLog('HAMMER', 'Cloud DNS Record Updated: @ 192.0.2.1 -> 203.0.113.5 (Backup Provider)', 'success');
    addLog('HAMMER', 'TTL Flushed. Propagation started.', 'info');
    setSentinelState('RECOVERED');
  };

  const toggleSimulation = () => {
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
  };

  const toggleChaos = () => {
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
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(runSimulationTick, 2000);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isActive, runSimulationTick]);

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
