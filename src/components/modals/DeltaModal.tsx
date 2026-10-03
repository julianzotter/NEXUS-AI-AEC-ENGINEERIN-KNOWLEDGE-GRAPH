/**
 * NEXUS-4 Delta Verification Modal
 * Inspects Candidate vs SIO-Kernel values side-by-side with zero-tolerance verification.
 */

import React from 'react';
import { DeltaCheckReport } from '../../kernels/deltaVerifier';
import { ShieldCheck, AlertOctagon, CheckCircle2, X } from 'lucide-react';

interface DeltaModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DeltaCheckReport | null;
}

export const DeltaModal: React.FC<DeltaModalProps> = ({ isOpen, onClose, report }) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-2xl w-full space-y-4 font-mono text-xs max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            {report.passed ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertOctagon className="w-5 h-5 text-rose-400" />
            )}
            <span className="font-bold text-slate-100 text-sm">
              SIO DELTA VERIFICATION REPORT (Δ = 0.000000%)
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className={`p-3 rounded-lg border ${
          report.passed 
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          <div className="font-bold flex items-center gap-1.5">
            {report.passed ? <CheckCircle2 className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
            {report.passed ? 'VERIFICATION PASSED' : 'SIO VETO TRIGGERED: DELTA DEVIATION'}
          </div>
          <p className="text-[11px] text-slate-300 mt-1">{report.message}</p>
        </div>

        {/* Comparisons Table */}
        <div className="flex-1 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="p-2.5">Parameter</th>
                <th className="p-2.5">Candidate Value</th>
                <th className="p-2.5">SIO Kernel Value</th>
                <th className="p-2.5">Delta (Absolute)</th>
                <th className="p-2.5">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {report.comparisons.map((c, i) => (
                <tr key={i} className="hover:bg-slate-900/50">
                  <td className="p-2.5 font-bold text-slate-200">{c.property}</td>
                  <td className="p-2.5 text-sky-400">{isNaN(c.candidateValue) ? 'NaN' : c.candidateValue.toFixed(4)}</td>
                  <td className="p-2.5 text-emerald-400">{c.kernelValue.toFixed(4)}</td>
                  <td className="p-2.5 text-slate-400">{c.delta.toExponential(4)}</td>
                  <td className="p-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'MATCH' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
