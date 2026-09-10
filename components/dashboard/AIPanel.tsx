'use client';

import { motion } from 'framer-motion';
import { useSimulation } from '@/lib/simulation/context';

const THEME = {
  Normal: { bg: '#0d1a0d', border: '#1a3a24', label: '#3fb950', badge: { bg: '#122a17', text: '#3fb950' } },
  LLL:    { bg: '#1a0808', border: '#450a0a', label: '#f85149', badge: { bg: '#2d0a0a', text: '#f85149' } },
  LL:     { bg: '#1a1000', border: '#4a2800', label: '#e3b341', badge: { bg: '#2d1c00', text: '#e3b341' } },
  LG:     { bg: '#151200', border: '#403200', label: '#d2a332', badge: { bg: '#241a00', text: '#d2a332' } },
  LLG:    { bg: '#1a1200', border: '#4a3000', label: '#e3b341', badge: { bg: '#2d2000', text: '#e3b341' } },
};

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 6, background: '#21262d', borderRadius: 3, overflow: 'hidden' }}>
      <motion.div
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        style={{ height: '100%', borderRadius: 3, background: color }}
      />
    </div>
  );
}

export default function AIPanel() {
  const { state } = useSimulation();
  const { aiResult, faultType, status } = state;
  const theme = THEME[aiResult.faultType];
  const isActive = status === 'running' || status === 'fault';
  const isFault = faultType !== 'Normal';

  const confColor = aiResult.faultType === 'Normal' ? '#3fb950' : aiResult.faultType === 'LLL' ? '#f85149' : '#e3b341';
  const riskColor = aiResult.riskPercentage > 70 ? '#f85149' : aiResult.riskPercentage > 30 ? '#e3b341' : '#3fb950';

  return (
    <div style={{
      background: theme.bg,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      transition: 'background 0.4s ease, border-color 0.4s ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          AI Fault Detection
        </div>
        <div style={{
          fontSize: 10, fontWeight: 600,
          padding: '2px 8px', borderRadius: 12,
          background: isActive ? theme.badge.bg : '#1c2330',
          color: isActive ? theme.badge.text : '#484f58',
          border: `1px solid ${isActive ? theme.border : '#21262d'}`,
        }}>
          {isActive ? 'Live' : 'Standby'}
        </div>
      </div>

      {/* Fault class */}
      <div>
        <div style={{ fontSize: 10, color: '#484f58', marginBottom: 6, fontWeight: 500 }}>Detected Class</div>
        <motion.div
          key={aiResult.faultType}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            fontSize: 22, fontWeight: 700, color: theme.label,
            fontFamily: "'SF Mono','Fira Code',monospace",
            letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>
          {aiResult.faultType === 'Normal' ? '✓ Normal' : `${aiResult.faultType} Fault`}
        </motion.div>
        {isFault && (
          <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>
            {faultType === 'LLL' ? 'Three-phase symmetric fault'
              : faultType === 'LL' ? 'Phase B–C line-to-line fault'
              : faultType === 'LG' ? 'Phase A line-to-ground fault'
              : 'Phases B–C double line-to-ground'}
          </div>
        )}
      </div>

      {/* Confidence */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <span style={{ fontSize: 12, color: '#8b949e' }}>Confidence</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: confColor,
            fontFamily: "'SF Mono',monospace" }}>
            {aiResult.confidence.toFixed(1)}%
          </span>
        </div>
        <Bar value={aiResult.confidence} color={confColor} />
      </div>

      {/* Risk */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <span style={{ fontSize: 12, color: '#8b949e' }}>Fault Risk</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: riskColor,
            fontFamily: "'SF Mono',monospace" }}>
            {aiResult.riskPercentage.toFixed(1)}%
          </span>
        </div>
        <Bar value={aiResult.riskPercentage} color={riskColor} />
      </div>

      {/* Recommended action */}
      <div>
        <div style={{ fontSize: 10, color: '#484f58', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Recommended Action
        </div>
        <motion.div
          key={aiResult.recommendedAction}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: 12, color: '#c9d1d9', lineHeight: 1.6,
            padding: '10px 12px', borderRadius: 5,
            background: '#0d1117', border: '1px solid #21262d',
          }}>
          {aiResult.recommendedAction}
        </motion.div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #21262d', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: '#30363d' }}>Random Forest (mock)</span>
        <span style={{ fontSize: 10, color: '#30363d' }}>Va · Vb · Vc · Ia · Ib · Ic · f</span>
      </div>
    </div>
  );
}
