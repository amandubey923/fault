'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '@/lib/simulation/context';
import { useMemo } from 'react';

const PHASE_COLORS = {
  A: '#e05252',
  B: '#3fb950',
  C: '#388bfd',
};

const PHASE_FAULT_COLORS = {
  A: '#f85149',
  B: '#56d364',
  C: '#79c0ff',
};

function FlowParticle({
  path, color, duration, delay, active,
}: {
  path: string; color: string; duration: number; delay: number; active: boolean;
}) {
  if (!active) return null;
  return (
    <circle r={2.5} fill={color} opacity={0.9}>
      <animateMotion dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" path={path} />
    </circle>
  );
}

function Wire({ d, color, active, fault, faultColor }: {
  d: string; color: string; active: boolean; fault?: boolean; faultColor?: string;
}) {
  const strokeColor = fault ? (faultColor ?? '#f85149') : active ? color : '#30363d';
  const strokeW = fault ? 2.5 : active ? 2 : 1.5;
  const opacity = active ? 1 : 0.5;

  return (
    <>
      {/* Wire shadow/glow for active state */}
      {active && (
        <path d={d} stroke={strokeColor} strokeWidth={strokeW + 3} fill="none"
          opacity={fault ? 0.12 : 0.06} strokeLinecap="round" />
      )}
      <path d={d} stroke={strokeColor} strokeWidth={strokeW} fill="none"
        opacity={opacity} strokeLinecap="round"
        strokeDasharray={fault ? '8 4' : undefined}
      />
      {active && !fault && (
        <>
          <FlowParticle path={d} color={color} duration={2.4} delay={0} active={active} />
          <FlowParticle path={d} color={color} duration={2.4} delay={0.8} active={active} />
          <FlowParticle path={d} color={color} duration={2.4} delay={1.6} active={active} />
        </>
      )}
      {active && fault && (
        <>
          <FlowParticle path={d} color={faultColor ?? '#f85149'} duration={1.2} delay={0} active={active} />
          <FlowParticle path={d} color={faultColor ?? '#f85149'} duration={1.2} delay={0.4} active={active} />
        </>
      )}
    </>
  );
}

function EquipBox({ x, y, w, h, label, sublabel, borderColor }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string; borderColor?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        fill="#161b22" stroke={borderColor ?? '#30363d'} strokeWidth={1} />
      <text x={x + w / 2} y={y + 14} textAnchor="middle"
        fill="#8b949e" fontSize={8} fontWeight="600" fontFamily="system-ui, sans-serif" letterSpacing="0.3">
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h - 7} textAnchor="middle"
          fill="#484f58" fontSize={6.5} fontFamily="'SF Mono', monospace">
          {sublabel}
        </text>
      )}
    </g>
  );
}

function SourceBlock({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <EquipBox x={-32} y={-46} w={64} h={92} label="SOURCE" sublabel="11 kV" borderColor="#30363d" />
      {(['A', 'B', 'C'] as const).map((ph, i) => (
        <g key={ph} transform={`translate(0, ${-20 + i * 14})`}>
          <circle cx={-14} cy={0} r={3.5} fill={PHASE_COLORS[ph]} opacity={0.85} />
          <text x={-5} y={4} fill={PHASE_COLORS[ph]} fontSize={7.5}
            fontFamily="'SF Mono', monospace" fontWeight="600">
            L{ph}
          </text>
        </g>
      ))}
    </g>
  );
}

function TransformerBlock({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <EquipBox x={-38} y={-50} w={76} h={100} label="TRANSFORMER" sublabel="11 kV / 0.4 kV · 10 MVA" borderColor="#30363d" />
      {[0, 1, 2].map(i => (
        <path key={`p${i}`} d={`M -18 ${-22 + i * 12} A 7 7 0 0 1 2 ${-22 + i * 12}`}
          stroke="#388bfd" strokeWidth={1.8} fill="none" opacity={0.7} />
      ))}
      {[0, 1, 2].map(i => (
        <path key={`s${i}`} d={`M 2 ${-22 + i * 12} A 7 7 0 0 1 18 ${-22 + i * 12}`}
          stroke="#3fb950" strokeWidth={1.8} fill="none" opacity={0.7} />
      ))}
      <line x1={2} y1={-28} x2={2} y2={16} stroke="#30363d" strokeWidth={0.8} strokeDasharray="2 2" />
    </g>
  );
}

function BreakerBlock({ x, y, state }: { x: number; y: number; state: string }) {
  const isTripped = state === 'tripped';
  const isOpen = state === 'open';
  const color = isTripped ? '#f85149' : isOpen ? '#e3b341' : '#3fb950';
  const borderColor = isTripped ? '#f85149' : isOpen ? '#e3b341' : '#21262d';

  return (
    <g transform={`translate(${x},${y})`}>
      <EquipBox x={-28} y={-46} w={56} h={92} label="BREAKER" borderColor={borderColor} />
      {/* Breaker symbol */}
      <line x1={0} y1={-28} x2={0} y2={-10} stroke={color} strokeWidth={2} strokeLinecap="round" />
      {isTripped ? (
        <line x1={0} y1={-10} x2={14} y2={4} stroke={color} strokeWidth={2} strokeLinecap="round" />
      ) : (
        <line x1={0} y1={-10} x2={0} y2={4} stroke={color} strokeWidth={2} strokeLinecap="round" />
      )}
      <line x1={0} y1={4} x2={0} y2={20} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <circle cx={0} cy={-28} r={2.5} fill={color} />
      <circle cx={0} cy={20} r={2.5} fill={color} />
      {/* Status label */}
      <rect x={-18} y={26} width={36} height={12} rx={3} fill={color} opacity={0.15} />
      <rect x={-18} y={26} width={36} height={12} rx={3} fill="none" stroke={color} strokeWidth={0.8} />
      <text x={0} y={35.5} textAnchor="middle" fill={color} fontSize={6.5}
        fontFamily="'SF Mono', monospace" fontWeight="700" letterSpacing="0.5">
        {isTripped ? 'TRIPPED' : isOpen ? 'OPEN' : 'CLOSED'}
      </text>
    </g>
  );
}

function LoadBlock({ x, y, active }: { x: number; y: number; active: boolean }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <EquipBox x={-30} y={-46} w={60} h={92} label="LOAD" sublabel="Industrial · 5 MW" borderColor="#30363d" />
      <line x1={0} y1={-22} x2={0} y2={-14} stroke="#484f58" strokeWidth={1.5} />
      <rect x={-10} y={-14} width={20} height={22} rx={2} fill="none" stroke={active ? '#484f58' : '#30363d'} strokeWidth={1.5} />
      <line x1={0} y1={8} x2={0} y2={18} stroke="#484f58" strokeWidth={1.5} />
    </g>
  );
}

function FaultBadge({ x, y, label, visible }: { x: number; y: number; label: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          transform={`translate(${x},${y})`}
        >
          <rect x={-22} y={-10} width={44} height={20} rx={4}
            fill="#450a0a" stroke="#f85149" strokeWidth={1} />
          <text x={0} y={4} textAnchor="middle" fill="#fca5a5"
            fontSize={7} fontFamily="'SF Mono', monospace" fontWeight="700">
            {label}
          </text>
        </motion.g>
      )}
    </AnimatePresence>
  );
}

function GroundFault({ x, y1, color, label }: { x: number; y1: number; color: string; label: string }) {
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <line x1={x} y1={y1} x2={x} y2={230} stroke={color} strokeWidth={1.5} strokeDasharray="5 3" opacity={0.7} />
      <line x1={x - 12} y1={230} x2={x + 12} y2={230} stroke={color} strokeWidth={1.5} />
      <line x1={x - 8} y1={235} x2={x + 8} y2={235} stroke={color} strokeWidth={1} opacity={0.8} />
      <line x1={x - 4} y1={240} x2={x + 4} y2={240} stroke={color} strokeWidth={0.8} opacity={0.6} />
      <text x={x} y={252} textAnchor="middle" fill={color} fontSize={7}
        fontFamily="'SF Mono', monospace" opacity={0.8}>
        {label}
      </text>
    </motion.g>
  );
}

export default function SubstationDiagram() {
  const { state } = useSimulation();
  const { status, faultType, breakerState } = state;

  const isActive = status === 'running' || status === 'fault';
  const isFault = faultType !== 'Normal';

  const wireSegments = useMemo(() => [
    // Source → Transformer
    { id: 'src-A-xfmr', phase: 'A' as const, path: 'M 112 136 L 182 136', fault: isFault && (faultType === 'LLL' || faultType === 'LLG') },
    { id: 'src-B-xfmr', phase: 'B' as const, path: 'M 112 150 L 182 150', fault: isFault && (faultType === 'LLL' || faultType === 'LL' || faultType === 'LLG') },
    { id: 'src-C-xfmr', phase: 'C' as const, path: 'M 112 164 L 182 164', fault: isFault && (faultType === 'LLL' || faultType === 'LL') },
    // Transformer → Breaker
    { id: 'xfmr-A-brk', phase: 'A' as const, path: 'M 258 136 L 332 136', fault: isFault && faultType === 'LLL' },
    { id: 'xfmr-B-brk', phase: 'B' as const, path: 'M 258 150 L 332 150', fault: isFault && (faultType === 'LLL' || faultType === 'LL' || faultType === 'LLG') },
    { id: 'xfmr-C-brk', phase: 'C' as const, path: 'M 258 164 L 332 164', fault: isFault && (faultType === 'LLL' || faultType === 'LL' || faultType === 'LLG') },
    // Breaker → Load
    { id: 'brk-A-load', phase: 'A' as const, path: 'M 388 136 L 470 136', fault: false },
    { id: 'brk-B-load', phase: 'B' as const, path: 'M 388 150 L 470 150', fault: false },
    { id: 'brk-C-load', phase: 'C' as const, path: 'M 388 164 L 470 164', fault: false },
  ], [isFault, faultType]);

  const showGroundA = isFault && faultType === 'LG';
  const showGroundBC = isFault && faultType === 'LLG';

  return (
    <div style={{
      position: 'relative',
      background: '#0d1117',
      border: `1px solid ${isFault ? '#450a0a' : '#21262d'}`,
      borderRadius: 8,
      overflow: 'hidden',
      transition: 'border-color 0.4s ease',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', borderBottom: '1px solid #161b22',
      }}>
        <span style={{ fontSize: 11, color: '#6e7681', fontWeight: 500 }}>
          One-Line Diagram — 3-Phase Substation
        </span>
        {isFault && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#f85149', fontWeight: 600 }}
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#f85149' }}
            />
            {faultType} Fault Detected
          </motion.div>
        )}
        {!isFault && isActive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#3fb950', fontWeight: 500 }}>
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#3fb950' }}
            />
            Normal Operation
          </div>
        )}
        {!isActive && (
          <span style={{ fontSize: 11, color: '#484f58' }}>Simulation paused</span>
        )}
      </div>

      <svg viewBox="0 0 580 300" style={{ width: '100%', minHeight: 270, display: 'block' }}>
        <defs>
          <filter id="particle-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="fault-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={580} height={300} fill="#0d1117" />

        {/* Subtle grid */}
        {[60, 110, 160, 210, 260].map(y => (
          <line key={`h${y}`} x1={10} y1={y} x2={570} y2={y} stroke="#161b22" strokeWidth={0.5} />
        ))}
        {[80, 160, 240, 320, 400, 480].map(x => (
          <line key={`v${x}`} x1={x} y1={50} x2={x} y2={260} stroke="#161b22" strokeWidth={0.5} />
        ))}

        {/* Phase lane labels */}
        {(['A', 'B', 'C'] as const).map((ph, i) => (
          <g key={ph}>
            <text x={18} y={140 + i * 14} fill={PHASE_COLORS[ph]} fontSize={8}
              fontFamily="'SF Mono', monospace" fontWeight="600" opacity={0.7}>
              L{ph}
            </text>
          </g>
        ))}

        {/* Wires */}
        {wireSegments.map(seg => (
          <Wire
            key={seg.id}
            d={seg.path}
            color={PHASE_COLORS[seg.phase]}
            faultColor={PHASE_FAULT_COLORS[seg.phase]}
            active={isActive && !(seg.id.startsWith('brk') && breakerState === 'tripped')}
            fault={seg.fault}
          />
        ))}

        {/* Ground faults */}
        {showGroundA && <GroundFault x={290} y1={136} color="#f85149" label="GND-A" />}
        {showGroundBC && (
          <>
            <GroundFault x={295} y1={150} color="#56d364" label="" />
            <GroundFault x={302} y1={164} color="#79c0ff" label="GND-BC" />
          </>
        )}

        {/* Components */}
        <SourceBlock x={80} y={150} />
        <TransformerBlock x={220} y={150} />
        <BreakerBlock x={360} y={150} state={breakerState} />
        <LoadBlock x={500} y={150} active={isActive && breakerState !== 'tripped'} />

        {/* Flow direction arrows between components */}
        {isActive && (
          <>
            <text x={148} y={126} textAnchor="middle" fill="#30363d" fontSize={9}>›</text>
            <text x={148} y={140} textAnchor="middle" fill="#30363d" fontSize={9}>›</text>
            <text x={148} y={154} textAnchor="middle" fill="#30363d" fontSize={9}>›</text>
          </>
        )}

        {/* Fault badges */}
        <FaultBadge x={220} y={80} label={`${faultType} FAULT`}
          visible={isActive && (faultType === 'LLL' || faultType === 'LL')} />
        <FaultBadge x={295} y={95} label={`${faultType} FAULT`}
          visible={isActive && (faultType === 'LG' || faultType === 'LLG')} />

        {/* Live values overlay */}
        {/* Voltage labels */}
        <text x={146} y={130} fill={PHASE_COLORS.A} fontSize={7}
          fontFamily="'SF Mono', monospace" opacity={0.85}>
          {state.phaseValues.Va.toFixed(1)} kV
        </text>
        <text x={146} y={144} fill={PHASE_COLORS.B} fontSize={7}
          fontFamily="'SF Mono', monospace" opacity={0.85}>
          {state.phaseValues.Vb.toFixed(1)} kV
        </text>
        <text x={146} y={158} fill={PHASE_COLORS.C} fontSize={7}
          fontFamily="'SF Mono', monospace" opacity={0.85}>
          {state.phaseValues.Vc.toFixed(1)} kV
        </text>

        {/* Current labels */}
        <text x={398} y={130} fill={PHASE_COLORS.A} fontSize={7}
          fontFamily="'SF Mono', monospace" opacity={0.85}>
          {state.phaseValues.Ia.toFixed(2)} kA
        </text>
        <text x={398} y={144} fill={PHASE_COLORS.B} fontSize={7}
          fontFamily="'SF Mono', monospace" opacity={0.85}>
          {state.phaseValues.Ib.toFixed(2)} kA
        </text>
        <text x={398} y={158} fill={PHASE_COLORS.C} fontSize={7}
          fontFamily="'SF Mono', monospace" opacity={0.85}>
          {state.phaseValues.Ic.toFixed(2)} kA
        </text>

        {/* Status bar */}
        <rect x={10} y={270} width={560} height={22} rx={3} fill="#161b22" />
        <circle cx={24} cy={281} r={4}
          fill={status === 'running' ? '#3fb950' : status === 'fault' ? '#f85149' : status === 'paused' ? '#e3b341' : '#484f58'}
        />
        <text x={34} y={285} fill="#6e7681" fontSize={7.5} fontFamily="'SF Mono', monospace">
          {`Status: ${status}  ·  Fault: ${faultType}  ·  Breaker: ${breakerState}  ·  ${state.phaseValues.frequency.toFixed(2)} Hz`}
        </text>
      </svg>
    </div>
  );
}
