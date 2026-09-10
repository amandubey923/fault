'use client';

import { motion } from 'framer-motion';
import { useSimulation } from '@/lib/simulation/context';
import type { FaultType } from '@/lib/types';

const FAULT_BUTTONS: { label: string; fault: FaultType; desc: string; bg: string; border: string; color: string }[] = [
  { label: 'LLL Fault',  fault: 'LLL', desc: 'Three-phase',         bg: '#2d1515', border: '#6b2121', color: '#f85149' },
  { label: 'LL Fault',   fault: 'LL',  desc: 'Line-to-line',        bg: '#2d1f10', border: '#6b4010', color: '#e3b341' },
  { label: 'LG Fault',   fault: 'LG',  desc: 'Line-to-ground',      bg: '#1f2210', border: '#4a5210', color: '#d2a332' },
  { label: 'LLG Fault',  fault: 'LLG', desc: 'Double line-ground',  bg: '#1c1a10', border: '#504810', color: '#c9aa3a' },
];

export default function SimulationControls() {
  const { state, start, pause, reset, injectFault } = useSimulation();
  const { status } = state;
  const isRunning = status === 'running' || status === 'fault';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Controls
      </div>

      {/* Primary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {!isRunning ? (
          <motion.button whileTap={{ scale: 0.97 }} onClick={start}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 6,
              background: '#1a3a24', border: '1px solid #2ea043',
              color: '#3fb950', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            <span style={{ fontSize: 10 }}>▶</span> Start Simulation
          </motion.button>
        ) : (
          <motion.button whileTap={{ scale: 0.97 }} onClick={pause}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 6,
              background: '#2d2610', border: '1px solid #6b5a00',
              color: '#e3b341', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            <span>⏸</span> Pause
          </motion.button>
        )}
        <motion.button whileTap={{ scale: 0.97 }} onClick={reset}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 6,
            background: '#1c2330', border: '1px solid #30363d',
            color: '#8b949e', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
          ↺ Reset
        </motion.button>
      </div>

      {/* Fault injection */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Inject Fault
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {FAULT_BUTTONS.map(btn => (
            <motion.button
              key={btn.fault}
              whileTap={{ scale: 0.96 }}
              onClick={() => injectFault(btn.fault)}
              disabled={!isRunning}
              style={{
                padding: '7px 8px', borderRadius: 6,
                background: btn.bg, border: `1px solid ${btn.border}`,
                color: btn.color, cursor: isRunning ? 'pointer' : 'not-allowed',
                opacity: isRunning ? 1 : 0.4,
                fontSize: 11, fontWeight: 600,
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1,
              }}>
              <span>{btn.label}</span>
              <span style={{ fontSize: 10, opacity: 0.65, fontWeight: 400 }}>{btn.desc}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Clear fault */}
      {state.faultType !== 'Normal' && isRunning && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => injectFault('Normal')}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 6,
            background: '#0d1f38', border: '1px solid #1f6feb',
            color: '#79c0ff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
          ✓ Clear Fault
        </motion.button>
      )}
    </div>
  );
}
