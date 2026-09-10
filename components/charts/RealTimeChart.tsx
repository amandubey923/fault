'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useSimulation } from '@/lib/simulation/context';

interface Props { type: 'voltage' | 'current'; }

const V_KEYS = [
  { key: 'Va', color: '#e05252', label: 'Va' },
  { key: 'Vb', color: '#3fb950', label: 'Vb' },
  { key: 'Vc', color: '#388bfd', label: 'Vc' },
];
const I_KEYS = [
  { key: 'Ia', color: '#e05252', label: 'Ia' },
  { key: 'Ib', color: '#3fb950', label: 'Ib' },
  { key: 'Ic', color: '#388bfd', label: 'Ic' },
];

export default function RealTimeChart({ type }: Props) {
  const { graphData, state } = useSimulation();
  const isVoltage = type === 'voltage';
  const keys = isVoltage ? V_KEYS : I_KEYS;
  const unit = isVoltage ? 'kV' : 'kA';
  const domain = isVoltage ? ([0, 14] as [number, number]) : ([0, 12] as [number, number]);
  const data = graphData.slice(-24);
  const isFault = state.faultType !== 'Normal';

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6e7681', marginBottom: 10 }}>
        {isVoltage ? 'Phase Voltage' : 'Phase Current'}
        <span style={{ marginLeft: 4, fontSize: 10, color: '#484f58' }}>({unit})</span>
      </div>
      <ResponsiveContainer width="100%" height={148}>
        <LineChart data={data} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#1c2330" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#484f58' }}
            tickLine={false}
            axisLine={{ stroke: '#21262d' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={domain}
            tick={{ fontSize: 10, fill: '#484f58' }}
            tickLine={false}
            axisLine={false}
            unit={unit}
            width={40}
          />
          {isVoltage && (
            <ReferenceLine y={11} stroke="#21262d" strokeDasharray="3 3" label={{
              value: 'Nom', position: 'right', fontSize: 9, fill: '#484f58',
            }} />
          )}
          <Tooltip
            contentStyle={{
              background: '#1c2330',
              border: '1px solid #30363d',
              borderRadius: 5,
              fontSize: 11,
              padding: '6px 10px',
            }}
            labelStyle={{ color: '#8b949e', fontSize: 10, marginBottom: 4 }}
            itemStyle={{ padding: '1px 0' }}
            cursor={{ stroke: '#30363d', strokeWidth: 1 }}
          />
          <Legend
            iconType="line"
            iconSize={12}
            wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
          />
          {keys.map(k => (
            <Line
              key={k.key}
              type="monotone"
              dataKey={k.key}
              stroke={isFault && k.key !== 'Va' && k.key !== 'Ia' ? k.color : k.color}
              dot={false}
              strokeWidth={isFault ? 2 : 1.5}
              isAnimationActive={false}
              opacity={0.9}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
