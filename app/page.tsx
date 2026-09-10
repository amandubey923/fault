'use client';

import { SimulationProvider } from '@/lib/simulation/context';
import SubstationDiagram from '@/components/substation/SubstationDiagram';
import SimulationControls from '@/components/substation/SimulationControls';
import PhaseMetrics from '@/components/dashboard/PhaseMetrics';
import SystemStatus from '@/components/dashboard/SystemStatus';
import AIPanel from '@/components/dashboard/AIPanel';
import EventHistory from '@/components/dashboard/EventHistory';
import RealTimeChart from '@/components/charts/RealTimeChart';

function Header() {
  return (
    <header style={{ borderBottom: '1px solid #21262d', background: '#0d1117' }}
      className="sticky top-0 z-50 flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-3">
        <div style={{ background: '#1f6feb', borderRadius: 6, padding: '4px 6px' }}>
          <svg viewBox="0 0 24 24" fill="white" width={14} height={14}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3', letterSpacing: '-0.01em' }}>
            Smart Substation Monitor
          </div>
          <div style={{ fontSize: 11, color: '#6e7681', marginTop: 1 }}>
            AI-Enabled Fault Detection · Simulation Mode
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6e7681' }}>
        <span>11 kV / 0.4 kV</span>
        <span style={{ color: '#30363d' }}>|</span>
        <span>3-Phase System</span>
        <span style={{ color: '#30363d' }}>|</span>
        <span>SCADA v2.4</span>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <SimulationProvider>
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1, padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, maxWidth: 1600, margin: '0 auto', width: '100%', alignContent: 'start' }}>

          {/* Left: controls + status */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Panel>
              <SimulationControls />
            </Panel>
            <Panel>
              <SystemStatus />
            </Panel>
          </div>

          {/* Center: diagram + charts + metrics */}
          <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SubstationDiagram />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Panel>
                <RealTimeChart type="voltage" />
              </Panel>
              <Panel>
                <RealTimeChart type="current" />
              </Panel>
            </div>
            <Panel>
              <PhaseMetrics />
            </Panel>
          </div>

          {/* Right: AI + events */}
          <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AIPanel />
            <Panel>
              <EventHistory />
            </Panel>
          </div>

        </main>

        <footer style={{ textAlign: 'center', fontSize: 11, color: '#30363d', padding: '8px', borderTop: '1px solid #161b22' }}>
          Simulation mode — not for operational use
        </footer>
      </div>
    </SimulationProvider>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#161b22',
      border: '1px solid #21262d',
      borderRadius: 8,
      padding: '14px 16px',
    }}>
      {children}
    </div>
  );
}
