import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProbeData } from '../types';

/**
 * Props for the LatencyChart component.
 */
interface Props {
  /** Array of probe data to visualize */
  data: ProbeData[];
}

/**
 * Real-time latency chart showing probe data across all regions.
 * Uses Recharts for responsive, animated line visualization.
 * 
 * @param props - Component props
 * @param props.data - Array of probe data points
 */
export const LatencyChart: React.FC<Props> = ({ data }) => {
  // Transform data for Recharts
  const chartData = data.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
    us: d.regions.find(r => r.id === 'us-central1')?.latency || 0,
    eu: d.regions.find(r => r.id === 'europe-west1')?.latency || 0,
    asia: d.regions.find(r => r.id === 'asia-east1')?.latency || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis 
          dataKey="time" 
          stroke="#64748b" 
          fontSize={10} 
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#64748b" 
          fontSize={10} 
          tickLine={false}
          axisLine={false}
          width={30}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px', color: '#fff' }}
          itemStyle={{ fontSize: '12px' }}
        />
        <Line 
          type="monotone" 
          dataKey="us" 
          stroke="#818cf8" 
          strokeWidth={2} 
          dot={false} 
          activeDot={{ r: 4 }} 
          isAnimationActive={false} // Performance for frequent updates
        />
        <Line 
          type="monotone" 
          dataKey="eu" 
          stroke="#34d399" 
          strokeWidth={2} 
          dot={false} 
          activeDot={{ r: 4 }} 
          isAnimationActive={false}
        />
        <Line 
          type="monotone" 
          dataKey="asia" 
          stroke="#fbbf24" 
          strokeWidth={2} 
          dot={false} 
          activeDot={{ r: 4 }} 
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
