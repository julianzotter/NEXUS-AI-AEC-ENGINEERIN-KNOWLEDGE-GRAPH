/**
 * NEXUS-4 4-Layer Governance Pipeline
 * Enforces the strict sequential gate chain: DAA -> ASO -> AEGS -> SIO
 */

import React from 'react';
import { GovernanceRole, RunEnvelope } from '../../types/nexus';
import { 
  Database, 
  Cpu, 
  Scale, 
  ShieldCheck, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  ChevronRight,
  Fingerprint
} from 'lucide-react';

interface GovernancePipelineProps {
  currentRun: RunEnvelope | null;
  activeRole: GovernanceRole;
  onSelectRole: (role: GovernanceRole) => void;
  onTriggerVeto: (role: GovernanceRole, reason: string) => void;
}

export const GovernancePipeline: React.FC<GovernancePipelineProps> = ({
  currentRun,
  activeRole,
  onSelectRole,
  onTriggerVeto
}) => {
  const gates: { role: GovernanceRole; title: string; subtitle: string; icon: any; color: string }[] = [
    {
      role: 'DAA',
      title: 'Data Advantage Architect',
      subtitle: 'SHA-256 & ETL Provenance',
      icon: Database,
      color: 'border-sky-500 text-sky-400 bg-sky-500/10'
    },
    {
      role: 'ASO',
      title: 'AI Systems Orchestrator',
      subtitle: 'Routing & Candidate CoT',
      icon: Cpu,
      color: 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
    },
    {
      role: 'AEGS',
      title: 'AI Ethics & Governance',
      subtitle: 'EU AI Act & Drift Check',
      icon: Scale,
      color: 'border-amber-500 text-amber-400 bg-amber-500/10'
    },
    {
      role: 'SIO',
      title: 'Structural Integrity Orchestrator',
      subtitle: 'Deterministic VETO Authority',
      icon: ShieldCheck,
      color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
    }
  ];

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-200">4-LAYER GOVERNANCE GATE CHAIN</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            DAA → ASO → AEGS → SIO
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Run State:</span>
          {currentRun?.status === 'SIO_VERIFIED' ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> SIO_VERIFIED
            </span>
          ) : currentRun?.status === 'VETOED' ? (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5" /> VETOED
            </span>
          ) : currentRun?.status === 'RUNNING' ? (
            <span className="text-amber-400 font-bold flex items-center gap-1 animate-pulse">
              <Clock className="w-3.5 h-3.5" /> IN_PIPELINE
            </span>
          ) : (
            <span className="text-slate-400 font-bold">READY (KANDIDAT)</span>
          )}
        </div>
      </div>

      {/* Grid of 4 sequential gates */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        {gates.map((g, idx) => {
          const stage = currentRun?.gateChain[g.role];
          const isSelected = activeRole === g.role;
          const Icon = g.icon;

          let badgeColor = 'bg-slate-800 text-slate-400';
          let statusText = 'IDLE';

          if (stage) {
            if (stage.status === 'PASSED') {
              badgeColor = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
              statusText = 'PASSED';
            } else if (stage.status === 'PROCESSING') {
              badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse';
              statusText = 'EVALUATING';
            } else if (stage.status === 'VETOED') {
              badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
              statusText = 'VETOED';
            }
          }

          return (
            <div
              key={g.role}
              onClick={() => onSelectRole(g.role)}
              className={`p-3 rounded-lg border cursor-pointer transition relative overflow-hidden ${
                isSelected
                  ? 'border-sky-500 bg-slate-800/90 shadow-lg ring-1 ring-sky-500/40'
                  : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${g.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-mono font-bold text-xs text-slate-200">{g.role}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{g.title}</div>
                  </div>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${badgeColor}`}>
                  {statusText}
                </span>
              </div>

              {/* Subtitle / Evidence */}
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-2 mt-2">
                <span className="truncate">{g.subtitle}</span>
                {stage?.hash && (
                  <span className="text-[9px] text-sky-400 flex items-center gap-0.5">
                    <Fingerprint className="w-3 h-3" /> {stage.hash.substring(0, 8)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
