'use client';

import { motion } from 'framer-motion';
import { useSimulation } from '@/lib/simulation/context';

function Row({ label, value, valueColor, bg }: {
  label: string; value: string; valueColor: string; bg?: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '7px 10px', borderRadius: 5,
      background: bg ?? '#0d1117', border: '1px solid #21262d',
    }}>
      <span style={{ fontSize: 12, color: '#8b949e' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: valueColor,
        fontFamily: "'SF Mono','Fira Code',monospace" }}>
        {value}
      </span>
    </div>
  );
}

export default function SystemStatus() {
  const { state } = useSimulation();
  const { status, faultType, breakerState, phaseValues } = state;
  const isFault = faultType !== 'Normal';
  const isRunning = status === 'running' || status === 'fault';

  const statusColor = status === 'running' ? '#3fb950'
    : status === 'fault' ? '#f85149'
    : status === 'paused' ? '#e3b341' : '#484f58';

  const faultColor = faultType === 'Normal' ? '#3fb950'
    : faultType === 'LLL' ? '#f85149' : '#e3b341';

  const breakerColor = breakerState === 'closed' ? '#3fb950'
    : breakerState === 'tripped' ? '#f85149' : '#e3b341';

  const Vavg = (phaseValues.Va + phaseValues.Vb + phaseValues.Vc) / 3;
  const Vunbal = (Math.max(
    Math.abs(phaseValues.Va - Vavg),
    Math.abs(phaseValues.Vb - Vavg),
    Math.abs(phaseValues.Vc - Vavg)
  ) / (Vavg + 1e-9) * 100);

  const unbalColor = Vunbal > 5 ? '#f85149' : Vunbal > 2 ? '#e3b341' : '#3fb950';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
        System Status
      </div>

      {/* Primary status block */}
      <motion.div
        animate={status === 'fault' ? {
          borderColor: ['#450a0a', '#6b1414', '#450a0a'],
        } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{
          padding: '10px 12px', borderRadius: 6,
          background: isFault ? '#1a0a0a' : isRunning ? '#0d1a0d' : '#161b22',
          border: `1px solid ${isFault ? '#450a0a' : isRunning ? '#1a3a24' : '#21262d'}`,
          display: 'flex', alignItems: 'center', gap: 10,
          transition: 'background 0.4s ease',
        }}>
        <motion.div
          animate={isRunning ? { opacity: [1, 0.4, 1] } : { opacity: 0.5 }}
          transition={{ repeat: isRunning ? Infinity : 0, duration: isFault ? 0.8 : 2 }}
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: statusColor, flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: statusColor, lineHeight: 1.3 }}>
            {status === 'idle' ? 'Idle'
              : status === 'running' ? 'Normal Operation'
              : status === 'paused' ? 'Paused'
              : `${faultType} Fault Active`}
          </div>
          <div style={{ fontSize: 11, color: '#484f58', marginTop: 2 }}>
            {new Date(state.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </motion.div>

      <Row label="Simulation" value={status} valueColor={statusColor} />
      <Row label="Fault" value={faultType} valueColor={faultColor} />
      <Row label="Breaker" value={breakerState} valueColor={breakerColor} />
      <Row label="V Unbalance" value={`${Vunbal.toFixed(2)}%`} valueColor={unbalColor} />
    </div>
  );
}
