'use client';

import { useSimulation } from '@/lib/simulation/context';
import { motion } from 'framer-motion';
import type { FaultEvent } from '@/lib/types';

function EventRow({ event }: { event: FaultEvent }) {
  const time = new Date(event.timestamp).toLocaleTimeString();
  const styles = {
    info:     { dot: '#388bfd', label: '#79c0ff', bg: '#0d1117', border: '#21262d' },
    warning:  { dot: '#e3b341', label: '#e3b341', bg: '#1a1400', border: '#3d3000' },
    critical: { dot: '#f85149', label: '#f85149', bg: '#1a0808', border: '#3d1010' },
  };
  const s = styles[event.severity];

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex', gap: 10, padding: '8px 10px',
        borderRadius: 5, background: s.bg, border: `1px solid ${s.border}`,
        marginBottom: 6,
      }}>
      <div style={{ paddingTop: 4, flexShrink: 0 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: s.label,
            fontFamily: "'SF Mono',monospace",
          }}>
            {event.faultType}
          </span>
          <span style={{ fontSize: 10, color: '#484f58' }}>{time}</span>
        </div>
        <div style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.4, marginBottom: 2 }}>
          {event.description}
        </div>
        <div style={{ fontSize: 10, color: '#484f58', fontFamily: "'SF Mono',monospace" }}>
          Va {event.phaseValues.Va.toFixed(1)} kV · Ia {event.phaseValues.Ia.toFixed(2)} kA
        </div>
      </div>
    </motion.div>
  );
}

export default function EventHistory() {
  const { events } = useSimulation();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Event Log
        </div>
        <div style={{ fontSize: 11, color: '#484f58' }}>{events.length} events</div>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: 260 }}>
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#484f58', fontSize: 12, padding: '24px 0' }}>
            No events recorded. Start simulation to monitor.
          </div>
        ) : (
          events.map(ev => <EventRow key={ev.id} event={ev} />)
        )}
      </div>
    </div>
  );
}
