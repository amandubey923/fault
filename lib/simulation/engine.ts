import type { FaultType, PhaseValues, AIResult, SimulationState, BreakerState } from '../types';

// Normal operating values
const NOMINAL_VOLTAGE = 11.0; // kV (phase-to-neutral)
const NOMINAL_CURRENT = 0.4; // kA
const NOMINAL_FREQUENCY = 50.0; // Hz

export function getNominalValues(): PhaseValues {
  return {
    Va: NOMINAL_VOLTAGE,
    Vb: NOMINAL_VOLTAGE,
    Vc: NOMINAL_VOLTAGE,
    Ia: NOMINAL_CURRENT,
    Ib: NOMINAL_CURRENT,
    Ic: NOMINAL_CURRENT,
    frequency: NOMINAL_FREQUENCY,
  };
}

function noise(magnitude: number): number {
  return (Math.random() - 0.5) * 2 * magnitude;
}

export function computeNormalValues(_tick: number): PhaseValues {
  const freqDrift = noise(0.05);
  return {
    Va: NOMINAL_VOLTAGE + noise(0.08),
    Vb: NOMINAL_VOLTAGE + noise(0.08),
    Vc: NOMINAL_VOLTAGE + noise(0.08),
    Ia: NOMINAL_CURRENT + noise(0.01),
    Ib: NOMINAL_CURRENT + noise(0.01),
    Ic: NOMINAL_CURRENT + noise(0.01),
    frequency: NOMINAL_FREQUENCY + freqDrift,
  };
}

export function computeFaultValues(faultType: FaultType, _tick: number): PhaseValues {
  const base = getNominalValues();

  switch (faultType) {
    case 'LLL': {
      // Three-phase fault: all voltages collapse, currents spike
      const vDrop = 0.15 + noise(0.03);
      const iSpike = 8.5 + noise(0.3);
      return {
        Va: base.Va * vDrop + noise(0.05),
        Vb: base.Vb * vDrop + noise(0.05),
        Vc: base.Vc * vDrop + noise(0.05),
        Ia: iSpike + noise(0.2),
        Ib: iSpike + noise(0.2),
        Ic: iSpike + noise(0.2),
        frequency: NOMINAL_FREQUENCY - 1.2 + noise(0.1),
      };
    }
    case 'LL': {
      // Line-to-line fault: two phases affected
      const vDrop = 0.35 + noise(0.04);
      const iSpike = 5.2 + noise(0.2);
      return {
        Va: base.Va + noise(0.05),
        Vb: base.Vb * vDrop + noise(0.04),
        Vc: base.Vc * vDrop + noise(0.04),
        Ia: NOMINAL_CURRENT + noise(0.02),
        Ib: iSpike + noise(0.15),
        Ic: iSpike + noise(0.15),
        frequency: NOMINAL_FREQUENCY - 0.6 + noise(0.05),
      };
    }
    case 'LG': {
      // Line-to-ground fault: one phase drops, ground current appears
      const vDrop = 0.1 + noise(0.02);
      const iSpike = 6.8 + noise(0.25);
      return {
        Va: base.Va * vDrop + noise(0.03),
        Vb: base.Vb * 1.1 + noise(0.05),
        Vc: base.Vc * 1.1 + noise(0.05),
        Ia: iSpike + noise(0.3),
        Ib: NOMINAL_CURRENT * 0.9 + noise(0.01),
        Ic: NOMINAL_CURRENT * 0.9 + noise(0.01),
        frequency: NOMINAL_FREQUENCY - 0.3 + noise(0.03),
      };
    }
    case 'LLG': {
      // Double line-to-ground: two phases drop, currents spike
      const vDropB = 0.2 + noise(0.03);
      const vDropC = 0.18 + noise(0.03);
      const iSpike = 7.0 + noise(0.2);
      return {
        Va: base.Va * 1.05 + noise(0.05),
        Vb: base.Vb * vDropB + noise(0.04),
        Vc: base.Vc * vDropC + noise(0.04),
        Ia: NOMINAL_CURRENT + noise(0.02),
        Ib: iSpike + noise(0.2),
        Ic: iSpike + noise(0.2),
        frequency: NOMINAL_FREQUENCY - 0.8 + noise(0.05),
      };
    }
    default:
      return computeNormalValues(_tick);
  }
}

export function getInitialState(): SimulationState {
  const phaseValues = getNominalValues();
  return {
    status: 'idle',
    faultType: 'Normal',
    phaseValues,
    breakerState: 'closed',
    aiResult: {
      faultType: 'Normal',
      confidence: 99.5,
      riskPercentage: 2,
      recommendedAction: 'System operating normally. No action required.',
    },
    timestamp: Date.now(),
  };
}
