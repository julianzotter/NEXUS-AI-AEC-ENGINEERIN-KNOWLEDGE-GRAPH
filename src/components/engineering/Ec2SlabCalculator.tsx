/**
 * NEXUS-4 Eurocode 2 Concrete Slab Calculator (EN 1992-1-1)
 * Closed-form analytical checks for Bending flexure, as,req steel, and shear VRd,c.
 */

import React, { useState } from 'react';
import { Ec2SlabParameters } from '../../types/nexus';
import { calculateEc2Slab, Ec2CalculationResult } from '../../kernels/ec2Kernel';
import { GOLDEN_EC2_SLAB } from '../../knowledge/goldenSet';
import { Calculator, Play, Layers } from 'lucide-react';

interface Ec2SlabCalculatorProps {
  onExecuteRun?: (params: Ec2SlabParameters) => void;
}

export const Ec2SlabCalculator: React.FC<Ec2SlabCalculatorProps> = ({ onExecuteRun }) => {
  const [params, setParams] = useState<Ec2SlabParameters>(GOLDEN_EC2_SLAB);

  const result: Ec2CalculationResult = calculateEc2Slab(params);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-md space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm">EN 1992-1-1 (EC2) REINFORCED CONCRETE SLAB</h2>
            <p className="text-slate-400 text-[11px]">Bending Cl. 6.1, Steel As,req, Shear without Shear Reinf. Cl. 6.2.2</p>
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
          <div className="text-[10px] text-slate-500">BENDING MOMENT MEd</div>
          <div className="text-lg font-bold text-purple-400">
            {result.M_Ed.toFixed(2)} <span className="text-xs font-normal text-slate-400">kNm/m</span>
          </div>
          <div className="text-[10px] text-slate-500">μEds = {result.mu_Eds.toFixed(3)}</div>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500">STEEL RATIO as,req / as,prov</div>
          <div className={`text-lg font-bold ${result.eta_M > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {(result.eta_M * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500">{result.as_req.toFixed(0)} / {result.as_prov.toFixed(0)} mm²/m</div>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500">SHEAR CAPACITY VRd,c</div>
          <div className={`text-lg font-bold ${result.eta_V > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {(result.eta_V * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500">VEd = {result.V_Ed.toFixed(1)} / VRd,c = {result.V_Rdc.toFixed(1)} kN/m</div>
        </div>
      </div>

      {/* Parameter Inputs */}
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
          <label className="text-[10px] text-slate-400">Thickness h (mm)</label>
          <input
            type="number"
            value={params.h}
            onChange={e => setParams(p => ({ ...p, h: parseFloat(e.target.value) || p.h }))}
            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 mt-1"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400">Rebar Ø (mm)</label>
          <input
            type="number"
            value={params.barDiameter}
            onChange={e => setParams(p => ({ ...p, barDiameter: parseFloat(e.target.value) || p.barDiameter }))}
            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 mt-1"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400">Pitch s (mm)</label>
          <input
            type="number"
            value={params.barSpacing}
            onChange={e => setParams(p => ({ ...p, barSpacing: parseFloat(e.target.value) || p.barSpacing }))}
            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 mt-1"
          />
        </div>
      </div>

      {/* Equations */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        {result.equations.map((eq, i) => (
          <div key={i} className="bg-slate-950 p-2 rounded flex justify-between items-center text-[11px]">
            <div>
              <div className="text-slate-200 font-bold">{eq.name}</div>
              <div className="text-slate-400">{eq.formula}</div>
            </div>
            <div className="text-purple-300 font-bold">{eq.result}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
