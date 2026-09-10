import type { FaultType, PhaseValues, AIResult } from '../types';

// Deterministic ML-like inference using fault signatures
// Structured for easy replacement with a real Python API endpoint

interface InferenceInput {
  Va: number;
  Vb: number;
  Vc: number;
  Ia: number;
  Ib: number;
  Ic: number;
  frequency: number;
}

interface ClassificationResult {
  faultType: FaultType;
  confidence: number;
  riskPercentage: number;
  recommendedAction: string;
}

const FAULT_RECOMMENDATIONS: Record<FaultType, string> = {
  Normal: 'System operating normally. Continue routine monitoring.',
  LLL: 'CRITICAL: Three-phase fault detected! Isolate all three phases immediately. Dispatch field crew for inspection.',
  LL: 'URGENT: Line-to-line fault on phases B & C. Trip affected feeder and inspect inter-phase insulation.',
  LG: 'WARNING: Phase A line-to-ground fault. Check ground connections and isolate affected conductor.',
  LLG: 'URGENT: Double line-to-ground fault detected. Trip feeder, check phases B & C for insulation damage.',
};

// Feature extraction for classification
function extractFeatures(input: InferenceInput) {
  const Vavg = (input.Va + input.Vb + input.Vc) / 3;
  const Iavg = (input.Ia + input.Ib + input.Ic) / 3;
  const Vunbalance = Math.max(
    Math.abs(input.Va - Vavg),
    Math.abs(input.Vb - Vavg),
    Math.abs(input.Vc - Vavg)
  ) / (Vavg + 1e-9);

  const Iunbalance = Math.max(
    Math.abs(input.Ia - Iavg),
    Math.abs(input.Ib - Iavg),
    Math.abs(input.Ic - Iavg)
  ) / (Iavg + 1e-9);

  const nominalV = 11.0;
  const nominalI = 0.4;
  const Vdrop = (nominalV - Vavg) / nominalV;
  const Ispike = Iavg / nominalI;

  return { Vavg, Iavg, Vunbalance, Iunbalance, Vdrop, Ispike };
}

// Mock inference — replicate Random Forest decision boundaries
export function runInference(input: InferenceInput): ClassificationResult {
  const f = extractFeatures(input);
  const { Vdrop, Ispike, Vunbalance, Iunbalance } = f;
  const nominalV = 11.0;

  // Determine fault type based on feature signatures
  let faultType: FaultType = 'Normal';
  let confidence = 99.5;
  let riskPercentage = 2;

  // LLL: all voltages collapse, high uniform current spike
  if (Vdrop > 0.70 && Ispike > 5 && Vunbalance < 0.15) {
    faultType = 'LLL';
    confidence = 92 + Math.random() * 6;
    riskPercentage = 95 + Math.random() * 4;
  }
  // LG: one phase drops, others may rise slightly, asymmetric
  else if (
    input.Va < nominalV * 0.5 &&
    input.Vb > nominalV * 0.9 &&
    input.Vc > nominalV * 0.9 &&
    input.Ia > 2.0
  ) {
    faultType = 'LG';
    confidence = 88 + Math.random() * 8;
    riskPercentage = 78 + Math.random() * 12;
  }
  // LLG: two phases drop, high currents on both
  else if (
    input.Va > nominalV * 0.9 &&
    input.Vb < nominalV * 0.5 &&
    input.Vc < nominalV * 0.5 &&
    input.Ib > 3.0 &&
    input.Ic > 3.0
  ) {
    faultType = 'LLG';
    confidence = 85 + Math.random() * 10;
    riskPercentage = 82 + Math.random() * 12;
  }
  // LL: two phases drop but not as severe as LLG, one phase normal
  else if (
    input.Va > nominalV * 0.9 &&
    input.Vb < nominalV * 0.7 &&
    input.Vc < nominalV * 0.7 &&
    input.Ib > 2.0 &&
    input.Ic > 2.0
  ) {
    faultType = 'LL';
    confidence = 87 + Math.random() * 9;
    riskPercentage = 70 + Math.random() * 15;
  }
  // Normal with minor imbalance warning
  else if (Vunbalance > 0.05 || Iunbalance > 0.1) {
    faultType = 'Normal';
    confidence = 94 + Math.random() * 4;
    riskPercentage = 8 + Math.random() * 8;
  } else {
    faultType = 'Normal';
    confidence = 98 + Math.random() * 2;
    riskPercentage = 1 + Math.random() * 4;
  }

  return {
    faultType,
    confidence: Math.min(confidence, 99.9),
    riskPercentage: Math.min(riskPercentage, 99.9),
    recommendedAction: FAULT_RECOMMENDATIONS[faultType],
  };
}

// API adapter — swap this for a real Python endpoint
export async function inferFault(phaseValues: PhaseValues): Promise<AIResult> {
  // To connect real Python API, replace this with:
  // const res = await fetch('/api/predict', { method: 'POST', body: JSON.stringify(phaseValues) });
  // return res.json();

  const result = runInference(phaseValues);
  return result;
}
