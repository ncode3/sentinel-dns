import { Region, SystemLog } from "./types";

export const MOCK_REGIONS: Region[] = [
  { id: 'us-central1', name: 'US Central (Iowa)', latency: 24, status: 'HEALTHY' },
  { id: 'europe-west1', name: 'Europe West (Belgium)', latency: 88, status: 'HEALTHY' },
  { id: 'asia-east1', name: 'Asia East (Taiwan)', latency: 145, status: 'HEALTHY' },
];

export const INITIAL_LOGS: SystemLog[] = [
  { id: '0', timestamp: new Date(), source: 'SYSTEM', message: 'Sentinel Core initialized.', type: 'info' },
  { id: '1', timestamp: new Date(), source: 'WATCHER', message: 'Probe configuration loaded: 3 Regions.', type: 'info' },
  { id: '2', timestamp: new Date(), source: 'BRAIN', message: 'Connected to Vertex AI (Gemini 1.5 Pro).', type: 'info' },
];
