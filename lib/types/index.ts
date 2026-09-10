export type FaultType = 'Normal' | 'LLL' | 'LL' | 'LG' | 'LLG';
export type SimulationStatus = 'idle' | 'running' | 'paused' | 'fault';
export type BreakerState = 'closed' | 'open' | 'tripped';

export interface PhaseValues {
  Va: number;
  Vb: number;
  Vc: number;
  Ia: number;
  Ib: number;
  Ic: number;
  frequency: number;
}

export interface AIResult {
  faultType: FaultType;
  confidence: number;
  riskPercentage: number;
  recommendedAction: string;
}

export interface SimulationState {
  status: SimulationStatus;
  faultType: FaultType;
  phaseValues: PhaseValues;
  aiResult: AIResult;
  breakerState: BreakerState;
  timestamp: number;
}

export interface FaultEvent {
  id: string;
  timestamp: number;
  faultType: FaultType;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  phaseValues: PhaseValues;
}

export interface GraphDataPoint {
  time: string;
  Va: number;
  Vb: number;
  Vc: number;
  Ia: number;
  Ib: number;
  Ic: number;
}
