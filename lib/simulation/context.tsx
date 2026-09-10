'use client';

import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect } from 'react';
import type { SimulationState, FaultType, FaultEvent, GraphDataPoint } from '@/lib/types';
import { computeNormalValues, computeFaultValues, getInitialState } from '@/lib/simulation/engine';
import { inferFault } from '@/lib/ai/inference';

interface SimulationContextType {
  state: SimulationState;
  graphData: GraphDataPoint[];
  events: FaultEvent[];
  start: () => void;
  pause: () => void;
  reset: () => void;
  injectFault: (fault: FaultType) => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

type Action =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SET_FAULT'; fault: FaultType }
  | { type: 'UPDATE'; payload: Partial<SimulationState> };

function reducer(state: SimulationState, action: Action): SimulationState {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'running' };
    case 'PAUSE':
      return { ...state, status: 'paused' };
    case 'RESET':
      return getInitialState();
    case 'SET_FAULT':
      return {
        ...state,
        faultType: action.fault,
        status: action.fault === 'Normal' ? 'running' : 'fault',
        breakerState: action.fault === 'Normal' ? 'closed' : 'tripped',
      };
    case 'UPDATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const MAX_GRAPH_POINTS = 60;

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, getInitialState());
  const [graphData, setGraphData] = React.useState<GraphDataPoint[]>([]);
  const [events, setEvents] = React.useState<FaultEvent[]>([]);
  const tickRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addEvent = useCallback((fault: FaultType, phaseValues: SimulationState['phaseValues']) => {
    const descriptions: Record<FaultType, string> = {
      Normal: 'System returned to normal operation',
      LLL: 'Three-Phase (LLL) Fault detected — all phases affected',
      LL: 'Line-to-Line (LL) Fault on phases B-C',
      LG: 'Line-to-Ground (LG) Fault on phase A',
      LLG: 'Double Line-to-Ground (LLG) Fault on phases B-C',
    };
    const severities: Record<FaultType, FaultEvent['severity']> = {
      Normal: 'info',
      LLL: 'critical',
      LL: 'warning',
      LG: 'warning',
      LLG: 'critical',
    };

    const event: FaultEvent = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      faultType: fault,
      description: descriptions[fault],
      severity: severities[fault],
      phaseValues,
    };

    setEvents(prev => [event, ...prev].slice(0, 20));
  }, []);

  const tick = useCallback(async () => {
    tickRef.current += 1;
    const t = tickRef.current;

    const currentFault = state.faultType;
    const phaseValues =
      currentFault === 'Normal'
        ? computeNormalValues(t)
        : computeFaultValues(currentFault, t);

    const aiResult = await inferFault(phaseValues);

    const now = new Date();
    const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    setGraphData(prev => {
      const next = [
        ...prev,
        {
          time: timeLabel,
          Va: +phaseValues.Va.toFixed(2),
          Vb: +phaseValues.Vb.toFixed(2),
          Vc: +phaseValues.Vc.toFixed(2),
          Ia: +phaseValues.Ia.toFixed(3),
          Ib: +phaseValues.Ib.toFixed(3),
          Ic: +phaseValues.Ic.toFixed(3),
        },
      ];
      return next.slice(-MAX_GRAPH_POINTS);
    });

    dispatch({
      type: 'UPDATE',
      payload: { phaseValues, aiResult, timestamp: Date.now() },
    });
  }, [state.faultType]);

  useEffect(() => {
    if (state.status === 'running' || state.status === 'fault') {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.status, tick]);

  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const reset = useCallback(() => {
    setGraphData([]);
    setEvents([]);
    tickRef.current = 0;
    dispatch({ type: 'RESET' });
  }, []);

  const injectFault = useCallback(
    (fault: FaultType) => {
      dispatch({ type: 'SET_FAULT', fault });
      if (fault !== 'Normal') {
        addEvent(fault, state.phaseValues);
      }
    },
    [state.phaseValues, addEvent]
  );

  return (
    <SimulationContext.Provider value={{ state, graphData, events, start, pause, reset, injectFault }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used inside SimulationProvider');
  return ctx;
}
