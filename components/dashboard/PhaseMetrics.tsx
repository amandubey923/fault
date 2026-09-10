'use client';

import { useSimulation } from '@/lib/simulation/context';

function MetricCard({ label, value, unit, phaseColor, status }: {
  label: string; value: string; unit: string; phaseColor: string;
  status: 'normal' | 'warning' | 'critical';
}) {
  const bg = status === 'critical' ? '#1a0a0a' : status === 'warning' ? '#1a1600' : '#0d1117';
  const border = status === 'critical' ? '#450a0a' : status === 'warning' ? '#3d3000' : '#21262d';
  const labelColor = '#6e7681';
  const unitColor = '#484f58';

  return (
    <div style={{
      padding: '10px 12px', borderRadius: 6,
      background: bg, border: `1px solid ${border}`,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: phaseColor, opacity: 0.85 }} />
        <span style={{ fontSize: 11, color: labelColor, fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{
          fontSize: 20, fontWeight: 600, color: phaseColor,
          fontFamily: "'SF Mono','Fira Code',ui-monospace,monospace",
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}>
          {value}
        </span>
        <span style={{ fontSize: 10, color: unitColor, fontFamily: "'SF Mono',monospace" }}>
          {unit}
        </span>
      </div>
      {status === 'critical' && (
        <div style={{ marginTop: 4, fontSize: 10, color: '#f85149', fontWeight: 500 }}>
          ● Fault detected
        </div>
      )}
      {status === 'warning' && (
        <div style={{ marginTop: 4, fontSize: 10, color: '#e3b341', fontWeight: 500 }}>
          ▲ Abnormal
        </div>
      )}
    </div>
  );
}

export default function PhaseMetrics() {
  const { state } = useSimulation();
  const { phaseValues, faultType } = state;
  const isFault = faultType !== 'Normal';

  const vStatus = (v: number) => isFault && v < 5.5 ? 'critical' as const
    : isFault ? 'warning' as const : 'normal' as const;
  const iStatus = (i: number) => isFault && i > 1.5 ? 'critical' as const
    : isFault ? 'warning' as const : 'normal' as const;
  const freqDev = Math.abs(phaseValues.frequency - 50);
  const freqStatus = freqDev > 1 ? 'critical' as const : freqDev > 0.5 ? 'warning' as const : 'normal' as const;
  const freqColor = freqStatus === 'critical' ? '#f85149' : freqStatus === 'warning' ? '#e3b341' : '#79c0ff';

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
        Phase Measurements
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        <MetricCard label="Va" value={phaseValues.Va.toFixed(2)} unit="kV"
          phaseColor="#e05252" status={vStatus(phaseValues.Va)} />
        <MetricCard label="Vb" value={phaseValues.Vb.toFixed(2)} unit="kV"
          phaseColor="#3fb950" status={vStatus(phaseValues.Vb)} />
        <MetricCard label="Vc" value={phaseValues.Vc.toFixed(2)} unit="kV"
          phaseColor="#388bfd" status={vStatus(phaseValues.Vc)} />

        <MetricCard label="Ia" value={phaseValues.Ia.toFixed(3)} unit="kA"
          phaseColor="#e05252" status={iStatus(phaseValues.Ia)} />
        <MetricCard label="Ib" value={phaseValues.Ib.toFixed(3)} unit="kA"
          phaseColor="#3fb950" status={iStatus(phaseValues.Ib)} />
        <MetricCard label="Ic" value={phaseValues.Ic.toFixed(3)} unit="kA"
          phaseColor="#388bfd" status={iStatus(phaseValues.Ic)} />

        <MetricCard label="Freq" value={phaseValues.frequency.toFixed(3)} unit="Hz"
          phaseColor={freqColor} status={freqStatus} />
      </div>
    </div>
  );
}
