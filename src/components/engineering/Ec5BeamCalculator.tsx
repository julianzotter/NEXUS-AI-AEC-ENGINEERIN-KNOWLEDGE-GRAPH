/**
 * NEXUS-4 Eurocode 5 Timber Beam Calculator (EN 1995-1-1)
 * Closed-form analytical checks for Biegung, Schub (kcr = 0.67), and Durchbiegung (wfin).
 */

import React, { useState } from 'react';
import { Ec5BeamParameters } from '../../types/nexus';
import { calculateEc5Beam, Ec5CalculationResult } from '../../kernels/ec5Kernel';
import { GOLDEN_EC5_BEAM } from '../../knowledge/goldenSet';
import { Calculator, Play, Layers } from 'lucide-react';

interface Ec5BeamCalculatorProps {
  onExecuteRun?: (params: Ec5BeamParameters) => void;
}

export const Ec5BeamCalculator: React.FC<Ec5BeamCalculatorProps> = ({ onExecuteRun }) => {
  const [params, setParams] = useState<Ec5BeamParameters>(GOLDEN_EC5_BEAM);

  const result: Ec5CalculationResult = calculateEc5Beam(params);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-md space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm">EN 1995-1-1 (EC5) TIMBER GIRDER</h2>
            <p className="text-slate-400 text-[11px]">Bending Cl. 6.1.6, Shear Cl. 6.1.7, Deflection Cl. 7.2</p>
          </div>
        </div>
        {onExecuteRun && (
          <button
            onClick={() => onExecuteRun(params)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> EXECUTE RUN
          </button>
        )}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500">BENDING ηM</div>
          <div className={`text-lg font-bold ${result.eta_M > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {(result.eta_M * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500">{result.sigma_m_d.toFixed(2)} / {result.f_m_d.toFixed(2)} MPa</div>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500">SHEAR ηV (kcr = 0.67)</div>
          <div className={`text-lg font-bold ${result.eta_V > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {(result.eta_V * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500">{result.tau_d.toFixed(2)} / {result.f_v_d.toFixed(2)} MPa</div>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500">DEFLECTION wfin</div>
          <div className={`text-lg font-bold ${result.eta_w > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {(result.eta_w * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500">{result.w_fin.toFixed(1)} / {result.w_limit.toFixed(1)} mm</div>
        </div>
      </div>

      {/* Parameter Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div>
          <label className="text-[10px] text-slate-400">Span L (m)</label>
          <input
            type="number"
            step="0.1"
            value={params.spanL}
            onChange={e => setParams(p => ({ ...p, spanL: parseFloat(e.target.value) || p.spanL }))}
            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 mt-1"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400">Width b (mm)</label>
          <input
            type="number"
            value={params.b}
            onChange={e => setParams(p => ({ ...p, b: parseFloat(e.target.value) || p.b }))}
            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 mt-1"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400">Height h (mm)</label>
          <input
            type="number"
            value={params.h}
            onChange={e => setParams(p => ({ ...p, h: parseFloat(e.target.value) || p.h }))}
            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 mt-1"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400">Dead Load gk (kN/m)</label>
          <input
            type="number"
            step="0.1"
            value={params.gk}
            onChange={e => setParams(p => ({ ...p, gk: parseFloat(e.target.value) || p.gk }))}
            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 mt-1"
          />
        </div>
      </div>

      {/* Step by Step Equations */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        {result.equations.map((eq, i) => (
          <div key={i} className="bg-slate-950 p-2 rounded flex justify-between items-center text-[11px]">
            <div>
              <div className="text-slate-200 font-bold">{eq.name}</div>
              <div className="text-slate-400">{eq.formula}</div>
            </div>
            <div className="text-sky-300 font-bold">{eq.result}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
